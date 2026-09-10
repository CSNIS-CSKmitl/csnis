import type { MonitoringProvider, NetworkDevice, NetworkSnapshot, DeviceStatus } from './types';
export const initialDevices: NetworkDevice[] = [
    { id: 'wan', name: 'WAN Router', kind: 'router', address: '10.0.0.1', location: 'Network edge', status: 'online', latency: 8, utilization: 32, x: 145, y: 85 },
    { id: 'firewall', name: 'Firewall', kind: 'firewall', address: '10.0.0.2', location: 'Security perimeter', status: 'online', latency: 2, utilization: 24, x: 450, y: 85 },
    { id: 'core', name: 'Core Switch', kind: 'core', address: '10.0.1.1', location: 'Data center · Core', status: 'online', latency: 1, utilization: 42, x: 300, y: 235 },
    { id: 'wlc', name: 'Wireless Controller', kind: 'wireless', address: '10.0.2.1', location: 'Campus wireless', status: 'online', latency: 3, utilization: 35, x: 110, y: 395 },
    { id: 'distribution', name: 'Distribution Switch', kind: 'switch', address: '10.0.3.1', location: 'Campus distribution', status: 'warning', latency: 12, utilization: 82, x: 300, y: 395 },
    { id: 'servers', name: 'Server Network', kind: 'server', address: '10.0.4.1', location: 'Data center · Servers', status: 'online', latency: 1, utilization: 28, x: 490, y: 395 }
];
export function linkStatus(a: DeviceStatus, b: DeviceStatus): DeviceStatus { return a === 'offline' || b === 'offline' ? 'offline' : a === 'warning' || b === 'warning' ? 'warning' : 'online'; }
export function createMockSnapshot(tick = 0, now = new Date()): NetworkSnapshot {
    const warning = Math.floor(tick / 3) % 2 === 0;
    const devices = initialDevices.map((device, index) => ({ ...device, status: device.id === 'distribution' ? (warning ? 'warning' : 'online') as DeviceStatus : device.status, utilization: device.id === 'distribution' ? (warning ? 82 + (tick % 5) : 47 + (tick % 9)) : device.utilization + (tick + index) % 7, latency: device.latency + (tick % 3) }));
    const pairs = [['wan', 'firewall'], ['firewall', 'core'], ['core', 'wlc'], ['core', 'distribution'], ['core', 'servers']];
    return { devices, links: pairs.map(([source, target], i) => ({ id: `link-${i}`, source, target, capacity: i === 0 ? '1 Gbps' : '10 Gbps', status: linkStatus(devices.find(d => d.id === source)!.status, devices.find(d => d.id === target)!.status) })), events: [{ id: `distribution-${Math.floor(tick / 3)}`, timestamp: now.toISOString(), status: warning ? 'warning' : 'online', message: warning ? 'Distribution Switch utilization is above 80%.' : 'Distribution Switch utilization returned to normal.', deviceId: 'distribution' }, { id: 'core-check', timestamp: new Date(now.getTime() - 60000).toISOString(), status: 'online', message: 'Core Switch connectivity check passed.', deviceId: 'core' }], timestamp: now.toISOString(), source: 'mock' };
}
export function createMockProvider(): MonitoringProvider {
    let tick = 0;
    return { async getSnapshot(signal) { signal?.throwIfAborted(); return createMockSnapshot(tick++); } };
}
