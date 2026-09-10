import type { MonitoringProvider, NetworkDevice, NetworkSnapshot, DeviceStatus } from './types';

export const initialDevices: NetworkDevice[] = [
    { id: 'wan', name: 'ISP WAN Uplink', kind: 'router', address: '1.1.1.1', location: 'WAN Connection', status: 'online', latency: 6, utilization: 25, x: 80, y: 85, width: 158, height: 100 },
    { id: 'vmbr0', name: 'Linux Bridge 0 (vmbr0)', kind: 'core', address: 'Unnumbered (L2 Bridge)', location: 'Host WAN Interface (eno0)', status: 'online', latency: 1, utilization: 22, x: 260, y: 85, width: 158, height: 100 },
    { id: 'opnsense', name: 'OPNsense Firewall VM', kind: 'firewall', address: '192.168.1.1', location: 'Router VM (vmbr0 in · vmbr1 out)', status: 'online', latency: 1, utilization: 18, x: 480, y: 85, width: 158, height: 100 },
    { id: 'vmbr1', name: 'Linux Bridge 1 (vmbr1)', kind: 'core', address: 'Unnumbered (L2 Bridge)', location: 'Host LAN Interface (eno3)', status: 'online', latency: 1, utilization: 38, x: 480, y: 235, width: 158, height: 100 },
    { id: 'dlink', name: 'D-Link Smart Switch', kind: 'switch', address: '192.168.1.250', location: 'Physical Switch (via eno3)', status: 'online', latency: 1, utilization: 34, x: 260, y: 235, width: 158, height: 100 },
    { id: 'wlc', name: 'Wireless Access Point', kind: 'wireless', address: '192.168.1.20', location: 'Office Wi-Fi (via D-Link)', status: 'online', latency: 4, utilization: 28, x: 120, y: 395, width: 158, height: 100 },
    { id: 'servers', name: 'Server VMs & Apps', kind: 'server', address: '192.168.1.50', location: 'Hosted VMs (via vmbr1)', status: 'online', latency: 1, utilization: 55, x: 420, y: 395, width: 158, height: 100 }
];

export function linkStatus(a: DeviceStatus, b: DeviceStatus): DeviceStatus {
    return a === 'offline' || b === 'offline' ? 'offline' : 'online';
}

export function createMockSnapshot(tick = 0, now = new Date()): NetworkSnapshot {
    const devices = initialDevices.map((device, index) => ({
        ...device,
        status: 'online' as DeviceStatus,
        utilization: Math.min(95, device.utilization + (tick + index) % 5),
        latency: Math.max(1, device.latency + (tick % 3))
    }));

    const pairs = [
        ['wan', 'vmbr0'],
        ['vmbr0', 'opnsense'],
        ['opnsense', 'vmbr1'],
        ['vmbr1', 'dlink'],
        ['dlink', 'wlc'],
        ['vmbr1', 'servers']
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
                status: 'online',
                message: 'All network devices, OPNsense VM, & D-Link Switch operating normally.',
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

