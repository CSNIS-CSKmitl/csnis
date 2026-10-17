import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMockSnapshot, linkStatus } from './mock';
import { createPoller } from './poller';
import { createApiProvider } from './api';
test('device and link status propagate consistently', () => {
    const snapshot = createMockSnapshot(0);
    assert.equal(snapshot.devices.find(d => d.id === 'vmbr1')?.status, 'online');
    assert.equal(snapshot.links.find(l => l.target === 'vmbr1')?.status, 'online');
    assert.equal(linkStatus('online', 'offline'), 'offline');
    assert.equal(linkStatus('online', 'online'), 'online');
    assert.equal(new Set(snapshot.devices.map(d => d.id)).size, snapshot.devices.length);
});


test('poller prevents overlap, supports manual refresh while paused, and aborts on disposal', async () => {
    let calls = 0, updates = 0, signal: AbortSignal | undefined;
    let complete: (data: ReturnType<typeof createMockSnapshot>) => void = () => { };
    const poller = createPoller({ getSnapshot(s) { calls++; signal = s; return new Promise(resolve => complete = resolve); } }, { snapshot: () => updates++, busy: () => { }, error: () => { } }, 5000);
    poller.setPaused(true);
    const first = poller.refresh();
    await poller.refresh();
    assert.equal(calls, 1);
    complete(createMockSnapshot());
    await first;
    assert.equal(updates, 1);
    const second = poller.refresh();
    assert.equal(calls, 2);
    poller.dispose();
    assert.equal(signal?.aborted, true);
    complete(createMockSnapshot());
    await second;
    assert.equal(updates, 1);
});
test('polling failure preserves previous state and clears busy state', async () => {
    const errors: string[] = [], busy: boolean[] = [];
    let calls = 0;
    const poller = createPoller({ async getSnapshot() { calls++; throw new Error('Unavailable'); } }, { snapshot: () => assert.fail('No update expected'), error: e => errors.push(e), busy: v => busy.push(v) });
    poller.setPaused(true);
    await poller.refresh();
    assert.equal(calls, 1);
    assert.deepEqual(errors, ['Unavailable']);
    assert.deepEqual(busy, [true, false]);
    poller.dispose();
});
test('API adapter rejects malformed data and dangling links', async () => {
    const original = globalThis.fetch;
    try {
        globalThis.fetch = async () => new Response(JSON.stringify({ devices: [] }));
        await assert.rejects(createApiProvider().getSnapshot(), /invalid snapshot/);
        const invalid = createMockSnapshot();
        invalid.links[0].target = 'missing';
        globalThis.fetch = async () => new Response(JSON.stringify(invalid));
        await assert.rejects(createApiProvider().getSnapshot(), /invalid snapshot/);
        globalThis.fetch = async () => new Response(JSON.stringify(createMockSnapshot()));
        assert.equal((await createApiProvider().getSnapshot()).source, 'api');
    }
    finally {
        globalThis.fetch = original;
    }
});

import {
    buildMonitoringTrend,
    calculateDeviceUptime,
    computeMonitoringStats,
    extractOfflineHistory,
    filterDevicesByDrilldown,
    filterSamplesByRange,
    parseSampleTimestamp,
    type MonitoringSample
} from '../monitoring-stats';

test('calculateDeviceUptime computes per-device uptime %, latency, and utilization accurately', () => {
    const now = new Date('2026-10-17T12:00:00.000Z');
    const samples: MonitoringSample[] = [
        {
            device_id: 'opnsense',
            device_name: 'OPNsense Firewall VM',
            status: 'online',
            latency_ms: 2,
            utilization: 20,
            checked_at: new Date(now.getTime() - 20 * 60_000).toISOString()
        },
        {
            device_id: 'opnsense',
            device_name: 'OPNsense Firewall VM',
            status: 'online',
            latency_ms: 4,
            utilization: 30,
            checked_at: new Date(now.getTime() - 10 * 60_000).toISOString()
        },
        {
            device_id: 'wlc',
            device_name: 'Wireless Access Point',
            status: 'offline',
            latency_ms: 0,
            utilization: 0,
            checked_at: new Date(now.getTime() - 20 * 60_000).toISOString()
        },
        {
            device_id: 'wlc',
            device_name: 'Wireless Access Point',
            status: 'online',
            latency_ms: 8,
            utilization: 40,
            checked_at: new Date(now.getTime() - 10 * 60_000).toISOString()
        }
    ];

    const stats = calculateDeviceUptime(samples);
    assert.equal(stats.opnsense.uptimePct, 100);
    assert.equal(stats.opnsense.totalSamples, 2);
    assert.equal(stats.opnsense.avgLatencyMs, 3);
    assert.equal(stats.opnsense.maxLatencyMs, 4);
    assert.equal(stats.opnsense.avgUtilization, 25);

    assert.equal(stats.wlc.uptimePct, 50);
    assert.equal(stats.wlc.onlineSamples, 1);
    assert.equal(stats.wlc.offlineSamples, 1);
});

test('extractOfflineHistory groups consecutive offline samples into resolved and ongoing incidents', () => {
    const t0 = '2026-10-17T10:00:00.000Z';
    const t1 = '2026-10-17T10:05:00.000Z';
    const t2 = '2026-10-17T10:15:00.000Z';
    const t3 = '2026-10-17T11:00:00.000Z';
    const samples: MonitoringSample[] = [
        { device_id: 'dlink', device_name: 'D-Link Switch', status: 'offline', latency_ms: 0, utilization: 0, checked_at: t0 },
        { device_id: 'dlink', device_name: 'D-Link Switch', status: 'offline', latency_ms: 0, utilization: 0, checked_at: t1 },
        { device_id: 'dlink', device_name: 'D-Link Switch', status: 'online', latency_ms: 2, utilization: 25, checked_at: t2 },
        { device_id: 'wan', device_name: 'ISP WAN Uplink', status: 'offline', latency_ms: 0, utilization: 0, checked_at: t3 }
    ];

    const history = extractOfflineHistory(samples);
    assert.equal(history.length, 2);

    const ongoing = history.find((h) => h.deviceId === 'wan');
    assert.ok(ongoing);
    assert.equal(ongoing.ongoing, true);
    assert.equal(ongoing.endedAt, null);
    assert.equal(ongoing.sampleCount, 1);

    const resolved = history.find((h) => h.deviceId === 'dlink');
    assert.ok(resolved);
    assert.equal(resolved.ongoing, false);
    assert.equal(resolved.startedAt, t0);
    assert.equal(resolved.endedAt, t2);
    assert.equal(resolved.durationMs, 15 * 60 * 1000);
    assert.equal(resolved.sampleCount, 2);
});

test('handles empty data and invalid timestamps safely', () => {
    assert.equal(parseSampleTimestamp('not-a-date'), null);
    assert.equal(parseSampleTimestamp(''), null);
    assert.equal(parseSampleTimestamp(null), null);

    const emptySummary = computeMonitoringStats(null, [], 'today');
    assert.equal(emptySummary.totalDevices, 0);
    assert.equal(emptySummary.overallUptimePct, 0);
    assert.deepEqual(emptySummary.offlineHistory, []);
    assert.deepEqual(emptySummary.trend, []);

    const malformedSamples: MonitoringSample[] = [
        { device_id: 'wan', device_name: 'WAN', status: 'online', latency_ms: 5, utilization: 20, checked_at: 'invalid-date' },
        { device_id: '', device_name: 'Empty', status: 'online', latency_ms: 5, utilization: 20, checked_at: new Date().toISOString() }
    ];
    assert.deepEqual(filterSamplesByRange(malformedSamples, 'all'), []);
    assert.deepEqual(extractOfflineHistory(malformedSamples), []);
    assert.deepEqual(buildMonitoringTrend(malformedSamples, 'all'), []);
});

test('filters samples by time range and filters devices by drilldown status', () => {
    const now = new Date('2026-10-17T15:00:00.000Z');
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600_000).toISOString();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600_000).toISOString();
    const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 3600_000).toISOString();
    const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 3600_000).toISOString();

    const samples: MonitoringSample[] = [
        { device_id: 'wan', device_name: 'WAN', status: 'online', latency_ms: 4, utilization: 20, checked_at: twoHoursAgo },
        { device_id: 'wan', device_name: 'WAN', status: 'online', latency_ms: 5, utilization: 25, checked_at: threeDaysAgo },
        { device_id: 'wan', device_name: 'WAN', status: 'offline', latency_ms: 0, utilization: 0, checked_at: twentyDaysAgo },
        { device_id: 'wan', device_name: 'WAN', status: 'online', latency_ms: 6, utilization: 30, checked_at: twoYearsAgo }
    ];

    assert.equal(filterSamplesByRange(samples, 'today', now).length, 1);
    assert.equal(filterSamplesByRange(samples, '7d', now).length, 2);
    assert.equal(filterSamplesByRange(samples, 'year', now).length, 3);
    assert.equal(filterSamplesByRange(samples, 'all', now).length, 4);

    const snapshot = createMockSnapshot(0, now);
    snapshot.devices[0].status = 'offline';
    snapshot.devices[1].latency = 85; // degraded (high latency)

    assert.equal(filterDevicesByDrilldown(snapshot.devices, 'all').length, snapshot.devices.length);
    assert.equal(filterDevicesByDrilldown(snapshot.devices, 'offline').length, 1);
    assert.equal(filterDevicesByDrilldown(snapshot.devices, 'online').length, snapshot.devices.length - 1);
    assert.equal(filterDevicesByDrilldown(snapshot.devices, 'degraded').length, 2);
});

