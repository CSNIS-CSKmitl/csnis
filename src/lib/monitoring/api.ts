import type { MonitoringProvider, NetworkSnapshot } from './types';
// Point this at a same-origin backend that normalizes vendor data to NetworkSnapshot.
// Keep monitoring credentials on that backend; never put API secrets in client code.
export function createApiProvider(endpoint: string | (() => string) = '/api/monitoring'): MonitoringProvider {
    return { async getSnapshot(signal) {
            const url = typeof endpoint === 'function' ? endpoint() : endpoint;
            const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
            if (!response.ok)
                throw new Error(`Monitoring service returned ${response.status}.`);
            const data: unknown = await response.json();
            if (!isSnapshot(data))
                throw new Error('Monitoring service returned an invalid snapshot.');
            return { ...data, source: 'api' };
        } };
}
function isSnapshot(value: unknown): value is NetworkSnapshot {
    if (!value || typeof value !== 'object')
        return false;
    const s = value as NetworkSnapshot;
    const status = (v: unknown) => ['online', 'offline'].includes(String(v));

    if (!Array.isArray(s.devices) || !Array.isArray(s.links) || !Array.isArray(s.events) || typeof s.timestamp !== 'string' || !Number.isFinite(Date.parse(s.timestamp)))
        return false;
    if (!s.devices.every(d => d && typeof d.id === 'string' && typeof d.name === 'string' && typeof d.address === 'string' && typeof d.location === 'string' && ['router', 'firewall', 'core', 'wireless', 'switch', 'server'].includes(d.kind) && status(d.status) && [d.latency, d.utilization, d.x, d.y].every(Number.isFinite) && d.utilization >= 0 && d.utilization <= 100 && d.x >= 0 && d.y >= 0))
        return false;
    const ids = new Set(s.devices.map(d => d.id));
    return ids.size === s.devices.length &&
           s.links.every(l => l && typeof l.id === 'string' && ids.has(l.source) && ids.has(l.target) && typeof l.capacity === 'string' && status(l.status)) &&
           s.events.every(e => e && typeof e.id === 'string' && typeof e.message === 'string' && status(e.status) && Number.isFinite(Date.parse(e.timestamp)));
}
