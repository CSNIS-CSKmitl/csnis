import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMockSnapshot, linkStatus } from './mock';
import { createPoller } from './poller';
import { createApiProvider } from './api';
test('warning recovery propagates consistently through devices and links', () => {
    const warning = createMockSnapshot(0), recovered = createMockSnapshot(3);
    assert.equal(warning.devices.find(d => d.id === 'distribution')?.status, 'warning');
    assert.equal(warning.links.find(l => l.target === 'distribution')?.status, 'warning');
    assert.equal(recovered.devices.find(d => d.id === 'distribution')?.status, 'online');
    assert.equal(recovered.links.find(l => l.target === 'distribution')?.status, 'online');
    assert.equal(linkStatus('warning', 'offline'), 'offline');
    assert.equal(new Set(warning.devices.map(d => d.id)).size, warning.devices.length);
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
