import type { DeviceKind, DeviceStatus, NetworkDevice, NetworkLink, NetworkSnapshot } from './monitoring/types';

export type StatsTimeRange = 'today' | '7d' | 'month' | 'year' | 'all';
export type DeviceFilter = 'all' | 'online' | 'offline' | 'degraded';

export interface MonitoringSample {
	id?: string;
	device_id: string;
	device_name: string;
	kind?: DeviceKind;
	status: DeviceStatus;
	latency_ms: number;
	utilization: number;
	checked_at: string;
}

export interface DeviceUptimeStat {
	deviceId: string;
	deviceName: string;
	totalSamples: number;
	onlineSamples: number;
	offlineSamples: number;
	uptimePct: number;
	avgLatencyMs: number;
	maxLatencyMs: number;
	avgUtilization: number;
	lastStatus: DeviceStatus;
	lastCheckedAt: string | null;
}

export interface OfflineIncident {
	id: string;
	deviceId: string;
	deviceName: string;
	startedAt: string;
	endedAt: string | null;
	durationMs: number;
	sampleCount: number;
	ongoing: boolean;
}

export interface MonitoringTrendPoint {
	bucket: string;
	label: string;
	timestamp: string;
	totalSamples: number;
	onlineCount: number;
	offlineCount: number;
	onlinePct: number;
	avgLatencyMs: number;
	avgUtilization: number;
}

export interface MonitoringStatsSummary {
	range: StatsTimeRange;
	totalDevices: number;
	onlineDevices: number;
	offlineDevices: number;
	degradedDevices: number;
	onlineLinks: number;
	offlineLinks: number;
	overallUptimePct: number;
	avgLatencyMs: number;
	avgUtilization: number;
	totalSamples: number;
	deviceStats: Record<string, DeviceUptimeStat>;
	offlineHistory: OfflineIncident[];
	trend: MonitoringTrendPoint[];
}

export const TIME_RANGE_OPTIONS: { value: StatsTimeRange; label: string; labelEn: string }[] = [
	{ value: 'today', label: 'วันนี้', labelEn: 'Today' },
	{ value: '7d', label: '7 วัน', labelEn: '7 Days' },
	{ value: 'month', label: 'เดือนนี้', labelEn: 'This Month' },
	{ value: 'year', label: 'ปีนี้', labelEn: 'This Year' },
	{ value: 'all', label: 'ทั้งหมด', labelEn: 'All Time' }
];

export function isValidTimeRange(value: unknown): value is StatsTimeRange {
	return typeof value === 'string' && ['today', '7d', 'month', 'year', 'all'].includes(value);
}

export function parseSampleTimestamp(value: unknown): number | null {
	if (typeof value === 'number') {
		return Number.isFinite(value) && value > 0 ? value : null;
	}
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const ms = Date.parse(trimmed);
	return Number.isFinite(ms) ? ms : null;
}

export function getRangeStartMs(range: StatsTimeRange, now: Date = new Date()): number | null {
	const nowMs = now.getTime();
	if (!Number.isFinite(nowMs)) return null;

	switch (range) {
		case 'today': {
			const start = new Date(now);
			start.setHours(0, 0, 0, 0);
			return start.getTime();
		}
		case '7d':
			return nowMs - 7 * 24 * 60 * 60 * 1000;
		case 'month': {
			const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
			return start.getTime();
		}
		case 'year': {
			const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
			return start.getTime();
		}
		case 'all':
		default:
			return null;
	}
}

export function filterSamplesByRange(
	samples: MonitoringSample[],
	range: StatsTimeRange,
	now: Date = new Date()
): MonitoringSample[] {
	if (!Array.isArray(samples) || samples.length === 0) return [];
	const startMs = getRangeStartMs(range, now);
	const nowMs = now.getTime();

	return samples.filter((sample) => {
		if (!sample || typeof sample.device_id !== 'string' || !sample.device_id.trim()) return false;
		if (sample.status !== 'online' && sample.status !== 'offline') return false;
		const ts = parseSampleTimestamp(sample.checked_at);
		if (ts === null) return false;
		if (startMs !== null && ts < startMs) return false;
		if (Number.isFinite(nowMs) && ts > nowMs + 60_000) return false;
		return true;
	});
}

export function snapshotToSamples(
	snapshot: Pick<NetworkSnapshot, 'devices' | 'timestamp'>
): MonitoringSample[] {
	if (!snapshot || !Array.isArray(snapshot.devices)) return [];
	const checkedAt =
		parseSampleTimestamp(snapshot.timestamp) !== null
			? snapshot.timestamp
			: new Date().toISOString();

	return snapshot.devices
		.filter((d) => d && typeof d.id === 'string' && d.id.trim().length > 0)
		.map((device) => ({
			device_id: device.id,
			device_name: device.name || device.id,
			kind: device.kind,
			status: device.status === 'offline' ? 'offline' : 'online',
			latency_ms: Number.isFinite(device.latency) ? Math.max(0, Math.round(device.latency)) : 0,
			utilization: Number.isFinite(device.utilization)
				? Math.min(100, Math.max(0, Math.round(device.utilization)))
				: 0,
			checked_at: checkedAt
		}));
}

export function calculateDeviceUptime(
	samples: MonitoringSample[],
	devices: NetworkDevice[] = []
): Record<string, DeviceUptimeStat> {
	const result: Record<string, DeviceUptimeStat> = {};
	const grouped = new Map<string, { sample: MonitoringSample; ts: number }[]>();

	if (Array.isArray(samples)) {
		for (const sample of samples) {
			if (!sample || typeof sample.device_id !== 'string' || !sample.device_id.trim()) continue;
			if (sample.status !== 'online' && sample.status !== 'offline') continue;
			const ts = parseSampleTimestamp(sample.checked_at);
			if (ts === null) continue;
			const list = grouped.get(sample.device_id) || [];
			list.push({ sample, ts });
			grouped.set(sample.device_id, list);
		}
	}

	const deviceMap = new Map<string, NetworkDevice>();
	if (Array.isArray(devices)) {
		for (const dev of devices) {
			if (dev && typeof dev.id === 'string' && dev.id.trim()) {
				deviceMap.set(dev.id, dev);
			}
		}
	}

	const allDeviceIds = new Set<string>([...deviceMap.keys(), ...grouped.keys()]);

	for (const deviceId of allDeviceIds) {
		const entries = grouped.get(deviceId) || [];
		entries.sort((a, b) => a.ts - b.ts);
		const dev = deviceMap.get(deviceId);

		if (entries.length === 0) {
			if (!dev) continue;
			const isOnline = dev.status === 'online';
			result[deviceId] = {
				deviceId,
				deviceName: dev.name || deviceId,
				totalSamples: 0,
				onlineSamples: 0,
				offlineSamples: 0,
				uptimePct: isOnline ? 100 : 0,
				avgLatencyMs: Number.isFinite(dev.latency) ? Math.max(0, Math.round(dev.latency)) : 0,
				maxLatencyMs: Number.isFinite(dev.latency) ? Math.max(0, Math.round(dev.latency)) : 0,
				avgUtilization: Number.isFinite(dev.utilization)
					? Math.min(100, Math.max(0, Math.round(dev.utilization)))
					: 0,
				lastStatus: dev.status,
				lastCheckedAt: null
			};
			continue;
		}

		let onlineSamples = 0;
		let offlineSamples = 0;
		let latencySum = 0;
		let latencyCount = 0;
		let maxLatencyMs = 0;
		let utilSum = 0;
		let utilCount = 0;

		for (const { sample } of entries) {
			if (sample.status === 'online') {
				onlineSamples++;
			} else {
				offlineSamples++;
			}
			if (Number.isFinite(sample.latency_ms) && sample.latency_ms >= 0) {
				latencySum += sample.latency_ms;
				latencyCount++;
				if (sample.latency_ms > maxLatencyMs) {
					maxLatencyMs = sample.latency_ms;
				}
			}
			if (Number.isFinite(sample.utilization) && sample.utilization >= 0) {
				utilSum += sample.utilization;
				utilCount++;
			}
		}

		const totalSamples = onlineSamples + offlineSamples;
		const uptimePct =
			totalSamples > 0 ? Math.round((onlineSamples / totalSamples) * 10000) / 100 : 0;
		const lastEntry = entries[entries.length - 1].sample;

		result[deviceId] = {
			deviceId,
			deviceName: dev?.name || lastEntry.device_name || deviceId,
			totalSamples,
			onlineSamples,
			offlineSamples,
			uptimePct,
			avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
			maxLatencyMs: Math.round(maxLatencyMs),
			avgUtilization: utilCount > 0 ? Math.round(utilSum / utilCount) : 0,
			lastStatus: dev?.status ?? lastEntry.status,
			lastCheckedAt: lastEntry.checked_at
		};
	}

	return result;
}

export function extractOfflineHistory(
	samples: MonitoringSample[],
	limit = 20
): OfflineIncident[] {
	if (!Array.isArray(samples) || samples.length === 0) return [];

	const byDevice = new Map<string, { sample: MonitoringSample; ts: number }[]>();
	for (const sample of samples) {
		if (!sample || typeof sample.device_id !== 'string' || !sample.device_id.trim()) continue;
		if (sample.status !== 'online' && sample.status !== 'offline') continue;
		const ts = parseSampleTimestamp(sample.checked_at);
		if (ts === null) continue;
		const list = byDevice.get(sample.device_id) || [];
		list.push({ sample, ts });
		byDevice.set(sample.device_id, list);
	}

	const incidents: (OfflineIncident & { sortTs: number })[] = [];

	for (const [deviceId, entries] of byDevice.entries()) {
		entries.sort((a, b) => a.ts - b.ts);

		let activeStart: { sample: MonitoringSample; ts: number } | null = null;
		let activeLast: { sample: MonitoringSample; ts: number } | null = null;
		let count = 0;

		for (const entry of entries) {
			if (entry.sample.status === 'offline') {
				if (!activeStart) {
					activeStart = entry;
					count = 1;
				} else {
					count++;
				}
				activeLast = entry;
			} else if (activeStart && activeLast) {
				const durationMs = Math.max(0, entry.ts - activeStart.ts);
				incidents.push({
					id: `inc-${deviceId}-${activeStart.ts}`,
					deviceId,
					deviceName: activeLast.sample.device_name || deviceId,
					startedAt: activeStart.sample.checked_at,
					endedAt: entry.sample.checked_at,
					durationMs,
					sampleCount: count,
					ongoing: false,
					sortTs: activeStart.ts
				});
				activeStart = null;
				activeLast = null;
				count = 0;
			}
		}

		if (activeStart && activeLast) {
			const durationMs = Math.max(0, activeLast.ts - activeStart.ts);
			incidents.push({
				id: `inc-${deviceId}-${activeStart.ts}`,
				deviceId,
				deviceName: activeLast.sample.device_name || deviceId,
				startedAt: activeStart.sample.checked_at,
				endedAt: null,
				durationMs,
				sampleCount: count,
				ongoing: true,
				sortTs: activeStart.ts
			});
		}
	}

	incidents.sort((a, b) => b.sortTs - a.sortTs);
	return incidents.slice(0, Math.max(1, limit)).map(({ sortTs: _sortTs, ...rest }) => rest);
}

export function buildMonitoringTrend(
	samples: MonitoringSample[],
	range: StatsTimeRange = 'today',
	now: Date = new Date()
): MonitoringTrendPoint[] {
	const filtered = filterSamplesByRange(samples, range, now);
	if (filtered.length === 0) return [];

	const withTs = filtered
		.map((sample) => ({ sample, ts: parseSampleTimestamp(sample.checked_at)! }))
		.filter((item) => item.ts !== null)
		.sort((a, b) => a.ts - b.ts);

	if (withTs.length === 0) return [];

	const spanMs = withTs[withTs.length - 1].ts - withTs[0].ts;
	let bucketSizeMs: number;
	if (range === 'year' || spanMs > 60 * 24 * 3600 * 1000) {
		bucketSizeMs = 7 * 24 * 3600 * 1000; // weekly buckets
	} else if (range === 'month' || spanMs > 7 * 24 * 3600 * 1000) {
		bucketSizeMs = 24 * 3600 * 1000; // daily buckets
	} else if (range === '7d' || spanMs > 24 * 3600 * 1000) {
		bucketSizeMs = 4 * 3600 * 1000; // 4-hour buckets
	} else if (spanMs > 2 * 3600 * 1000) {
		bucketSizeMs = 15 * 60 * 1000; // 15-minute buckets
	} else {
		bucketSizeMs = 60 * 1000; // 1-minute buckets for live polling
	}

	const buckets = new Map<
		number,
		{
			ts: number;
			onlineCount: number;
			offlineCount: number;
			latencySum: number;
			latencyCount: number;
			utilSum: number;
			utilCount: number;
		}
	>();

	for (const { sample, ts } of withTs) {
		const key = Math.floor(ts / bucketSizeMs) * bucketSizeMs;
		const b = buckets.get(key) || {
			ts: key,
			onlineCount: 0,
			offlineCount: 0,
			latencySum: 0,
			latencyCount: 0,
			utilSum: 0,
			utilCount: 0
		};
		if (sample.status === 'online') b.onlineCount++;
		else b.offlineCount++;

		if (Number.isFinite(sample.latency_ms) && sample.latency_ms >= 0) {
			b.latencySum += sample.latency_ms;
			b.latencyCount++;
		}
		if (Number.isFinite(sample.utilization) && sample.utilization >= 0) {
			b.utilSum += sample.utilization;
			b.utilCount++;
		}
		buckets.set(key, b);
	}

	const points: MonitoringTrendPoint[] = Array.from(buckets.values())
		.sort((a, b) => a.ts - b.ts)
		.slice(-24)
		.map((b) => {
			const totalSamples = b.onlineCount + b.offlineCount;
			const onlinePct =
				totalSamples > 0 ? Math.round((b.onlineCount / totalSamples) * 10000) / 100 : 0;
			const date = new Date(b.ts);
			const label =
				bucketSizeMs >= 24 * 3600 * 1000
					? date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
					: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

			return {
				bucket: String(b.ts),
				label,
				timestamp: date.toISOString(),
				totalSamples,
				onlineCount: b.onlineCount,
				offlineCount: b.offlineCount,
				onlinePct,
				avgLatencyMs: b.latencyCount > 0 ? Math.round(b.latencySum / b.latencyCount) : 0,
				avgUtilization: b.utilCount > 0 ? Math.round(b.utilSum / b.utilCount) : 0
			};
		});

	return points;
}

export function isDeviceDegraded(device: Pick<NetworkDevice, 'status' | 'latency' | 'utilization'>): boolean {
	if (!device) return false;
	return (
		device.status === 'offline' ||
		(Number.isFinite(device.latency) && device.latency >= 50) ||
		(Number.isFinite(device.utilization) && device.utilization >= 80)
	);
}

export function filterDevicesByDrilldown(
	devices: NetworkDevice[],
	filter: DeviceFilter
): NetworkDevice[] {
	if (!Array.isArray(devices)) return [];
	switch (filter) {
		case 'online':
			return devices.filter((d) => d.status === 'online');
		case 'offline':
			return devices.filter((d) => d.status === 'offline');
		case 'degraded':
			return devices.filter((d) => isDeviceDegraded(d));
		case 'all':
		default:
			return devices;
	}
}

export function computeMonitoringStats(
	snapshot: { devices: NetworkDevice[]; links?: NetworkLink[]; timestamp?: string } | null,
	samples: MonitoringSample[],
	range: StatsTimeRange = 'today',
	now: Date = new Date()
): MonitoringStatsSummary {
	const devices = snapshot?.devices ?? [];
	const links = snapshot?.links ?? [];

	const filteredSamples = filterSamplesByRange(samples, range, now);
	const effectiveSamples =
		filteredSamples.length > 0
			? filteredSamples
			: snapshot
				? filterSamplesByRange(
						snapshotToSamples({
							devices,
							timestamp: snapshot.timestamp || now.toISOString()
						}),
						range,
						now
					)
				: [];

	const deviceStats = calculateDeviceUptime(effectiveSamples, devices);
	const offlineHistory = extractOfflineHistory(effectiveSamples, 20);
	const trend = buildMonitoringTrend(effectiveSamples, range, now);

	const totalDevices = devices.length;
	const onlineDevices = devices.filter((d) => d.status === 'online').length;
	const offlineDevices = devices.filter((d) => d.status === 'offline').length;
	const degradedDevices = devices.filter((d) => isDeviceDegraded(d)).length;

	const onlineLinks = links.filter((l) => {
		const s = devices.find((d) => d.id === l.source);
		const t = devices.find((d) => d.id === l.target);
		return l.status === 'online' && s?.status !== 'offline' && t?.status !== 'offline';
	}).length;
	const offlineLinks = Math.max(0, links.length - onlineLinks);

	const statValues = Object.values(deviceStats);
	const overallUptimePct =
		statValues.length > 0
			? Math.round(
					(statValues.reduce((sum, item) => sum + item.uptimePct, 0) / statValues.length) * 100
				) / 100
			: totalDevices > 0
				? Math.round((onlineDevices / totalDevices) * 10000) / 100
				: 0;

	const avgLatencyMs =
		devices.length > 0
			? Math.round(
					devices.reduce((sum, d) => sum + (Number.isFinite(d.latency) ? d.latency : 0), 0) /
						devices.length
				)
			: statValues.length > 0
				? Math.round(
						statValues.reduce((sum, s) => sum + s.avgLatencyMs, 0) / statValues.length
					)
				: 0;

	const avgUtilization =
		devices.length > 0
			? Math.round(
					devices.reduce(
						(sum, d) => sum + (Number.isFinite(d.utilization) ? d.utilization : 0),
						0
					) / devices.length
				)
			: statValues.length > 0
				? Math.round(
						statValues.reduce((sum, s) => sum + s.avgUtilization, 0) / statValues.length
					)
				: 0;

	return {
		range,
		totalDevices,
		onlineDevices,
		offlineDevices,
		degradedDevices,
		onlineLinks,
		offlineLinks,
		overallUptimePct,
		avgLatencyMs,
		avgUtilization,
		totalSamples: effectiveSamples.length,
		deviceStats,
		offlineHistory,
		trend
	};
}
