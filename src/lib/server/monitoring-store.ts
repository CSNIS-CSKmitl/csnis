import {
	filterSamplesByRange,
	parseSampleTimestamp,
	snapshotToSamples,
	type MonitoringSample,
	type StatsTimeRange
} from '$lib/monitoring-stats';
import type { NetworkDevice } from '$lib/monitoring/types';

const MAX_IN_MEMORY_SAMPLES = 2500;
const MIN_PERSIST_INTERVAL_MS = 15_000;

let rollingSamples: MonitoringSample[] = [];
let lastPocketBaseWriteAt = 0;
let pbToken = '';
let pbTokenExpires = 0;

function getPocketBaseBaseUrl(): string {
	return (process.env.PRIVATE_POCKETBASE_URL || process.env.POCKETBASE_URL || '').replace(/\/$/, '');
}

async function getPocketBaseAdminToken(): Promise<string | null> {
	const base = getPocketBaseBaseUrl();
	const email = process.env.PB_ADMIN_EMAIL || '';
	const password = process.env.PB_ADMIN_PASSWORD || '';
	if (!base || !email || !password) return null;
	if (pbToken && pbTokenExpires > Date.now()) return pbToken;

	try {
		const response = await fetch(`${base}/api/collections/_superusers/auth-with-password`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ identity: email, password })
		});
		if (!response.ok) return null;
		const data = (await response.json()) as { token?: string };
		pbToken = data.token || '';
		pbTokenExpires = Date.now() + 4 * 60 * 1000;
		return pbToken || null;
	} catch {
		return null;
	}
}

export async function recordMonitoringSamples(
	devices: NetworkDevice[],
	checkedAtIso: string
): Promise<MonitoringSample[]> {
	const newSamples = snapshotToSamples({ devices, timestamp: checkedAtIso });
	if (newSamples.length === 0) return rollingSamples;

	rollingSamples.push(...newSamples);
	if (rollingSamples.length > MAX_IN_MEMORY_SAMPLES) {
		rollingSamples = rollingSamples.slice(rollingSamples.length - MAX_IN_MEMORY_SAMPLES);
	}

	const nowMs = Date.now();
	if (nowMs - lastPocketBaseWriteAt >= MIN_PERSIST_INTERVAL_MS) {
		lastPocketBaseWriteAt = nowMs;
		void persistSamplesToPocketBase(newSamples);
	}

	return rollingSamples;
}

async function persistSamplesToPocketBase(samples: MonitoringSample[]): Promise<void> {
	const base = getPocketBaseBaseUrl();
	const token = await getPocketBaseAdminToken();
	if (!base || !token) return;

	try {
		await Promise.allSettled(
			samples.map((sample) =>
				fetch(`${base}/api/collections/monitoring_samples/records`, {
					method: 'POST',
					headers: {
						authorization: token,
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						device_id: sample.device_id,
						device_name: sample.device_name,
						kind: sample.kind || 'switch',
						status: sample.status,
						latency_ms: sample.latency_ms,
						utilization: sample.utilization,
						checked_at: sample.checked_at
					})
				})
			)
		);
	} catch {
		// Best-effort persistence when PocketBase is unreachable
	}
}

export async function loadMonitoringSamples(
	range: StatsTimeRange = 'today',
	now: Date = new Date()
): Promise<MonitoringSample[]> {
	const base = getPocketBaseBaseUrl();
	const token = await getPocketBaseAdminToken();

	if (base && token) {
		try {
			const res = await fetch(
				`${base}/api/collections/monitoring_samples/records?perPage=500&sort=-checked_at`,
				{
					headers: { authorization: token }
				}
			);
			if (res.ok) {
				const payload = (await res.json()) as {
					items?: Array<{
						id?: string;
						device_id?: string;
						device_name?: string;
						kind?: MonitoringSample['kind'];
						status?: string;
						latency_ms?: number;
						utilization?: number;
						checked_at?: string;
						created?: string;
					}>;
				};
				if (Array.isArray(payload.items) && payload.items.length > 0) {
					const pbSamples: MonitoringSample[] = payload.items
						.map((item) => ({
							id: item.id,
							device_id: String(item.device_id || ''),
							device_name: String(item.device_name || item.device_id || ''),
							kind: item.kind,
							status: (item.status === 'offline' ? 'offline' : 'online') as 'online' | 'offline',
							latency_ms: Number(item.latency_ms) || 0,
							utilization: Number(item.utilization) || 0,
							checked_at: String(item.checked_at || item.created || '')
						}))
						.filter((s) => s.device_id && parseSampleTimestamp(s.checked_at) !== null);

					const mergedMap = new Map<string, MonitoringSample>();
					for (const s of [...pbSamples, ...rollingSamples]) {
						const key = `${s.device_id}:${s.checked_at}`;
						mergedMap.set(key, s);
					}
					return filterSamplesByRange(Array.from(mergedMap.values()), range, now);
				}
			}
		} catch {
			// Fallback to in-memory rolling samples
		}
	}

	return filterSamplesByRange(rollingSamples, range, now);
}
