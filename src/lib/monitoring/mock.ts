import type { MonitoringProvider, NetworkDevice, NetworkSnapshot, DeviceStatus } from './types';

export const initialDevices: NetworkDevice[] = [
    { id: 'wan', name: 'WAN Gateway', kind: 'router', address: '1.1.1.1', location: 'ISP Edge', status: 'online', latency: 6, utilization: 25, x: 145, y: 85 },
    { id: 'opnsense', name: 'OPNsense Firewall', kind: 'firewall', address: '192.168.1.1', location: 'Gateway & Security', status: 'online', latency: 1, utilization: 18, x: 450, y: 85 },
    { id: 'dlink', name: 'D-Link Smart Switch', kind: 'switch', address: '192.168.1.2', location: 'Core L2/L3 Management', status: 'online', latency: 1, utilization: 34, x: 300, y: 235 },
    { id: 'linux-bridge', name: 'Linux Bridge', kind: 'core', address: '192.168.1.10', location: 'Hypervisor & Virtual Network', status: 'online', latency: 2, utilization: 42, x: 110, y: 395 },
    { id: 'wlc', name: 'Wireless Access Point', kind: 'wireless', address: '192.168.1.20', location: 'Office & Campus Wi-Fi', status: 'online', latency: 4, utilization: 28, x: 300, y: 395 },
    { id: 'servers', name: 'Server Cluster / VMs', kind: 'server', address: '192.168.1.50', location: 'Host Services & Data', status: 'online', latency: 1, utilization: 55, x: 490, y: 395 }
];

export function linkStatus(a: DeviceStatus, b: DeviceStatus): DeviceStatus {
    return a === 'offline' || b === 'offline' ? 'offline' : a === 'warning' || b === 'warning' ? 'warning' : 'online';
}

export function createMockSnapshot(tick = 0, now = new Date()): NetworkSnapshot {
    const warning = Math.floor(tick / 3) % 2 === 0;
    const devices = initialDevices.map((device, index) => ({
        ...device,
        status: device.id === 'linux-bridge' ? (warning ? 'warning' : 'online') as DeviceStatus : device.status,
        utilization: device.id === 'linux-bridge' ? (warning ? 84 + (tick % 4) : 42 + (tick % 7)) : Math.min(98, device.utilization + (tick + index) % 5),
        latency: Math.max(1, device.latency + (tick % 3))
    }));

    const pairs = [
        ['wan', 'opnsense'],
        ['opnsense', 'dlink'],
        ['dlink', 'linux-bridge'],
        ['dlink', 'wlc'],
        ['dlink', 'servers'],
        ['linux-bridge', 'servers']
    ];
    return {
        devices,
        links: pairs.map(([source, target], i) => ({
            id: `link-${i}`,
            source,
            target,
            capacity: i === 0 ? '1 Gbps' : '10 Gbps',
            status: linkStatus(devices.find(d => d.id === source)!.status, devices.find(d => d.id === target)!.status)
        })),
        events: [
            {
                id: `evt-${tick}`,
                timestamp: now.toISOString(),
                status: warning ? 'warning' : 'online',
                message: warning ? 'Linux Bridge traffic load elevated above 80%.' : 'OPNsense and D-Link Smart Switch operating normally.',
                deviceId: 'linux-bridge'
            },
            {
                id: 'opnsense-pass',
                timestamp: new Date(now.getTime() - 45000).toISOString(),
                status: 'online',
                message: 'OPNsense Firewall gateway rule check passed.',
                deviceId: 'opnsense'
            }
        ],
        timestamp: now.toISOString(),
        source: 'mock'
    };
}

export function createMockProvider(): MonitoringProvider {
    let tick = 0;
    return {
        async getSnapshot(signal) {
            signal?.throwIfAborted();
            return createMockSnapshot(tick++);
        }
    };
}

