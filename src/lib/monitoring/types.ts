export type DeviceStatus = 'online' | 'offline';

export type DeviceKind = 'router' | 'firewall' | 'core' | 'wireless' | 'switch' | 'server';
export interface NetworkDevice {
    id: string;
    name: string;
    kind: DeviceKind;
    address: string;
    location: string;
    status: DeviceStatus;
    latency: number;
    utilization: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
}
export interface NetworkLink {
    id: string;
    source: string;
    target: string;
    capacity: string;
    status: DeviceStatus;
}
export interface NetworkEvent {
    id: string;
    timestamp: string;
    status: DeviceStatus;
    message: string;
    deviceId: string;
}
export interface NetworkSnapshot {
    devices: NetworkDevice[];
    links: NetworkLink[];
    events: NetworkEvent[];
    timestamp: string;
    source: 'mock' | 'api';
}
export interface MonitoringProvider {
    getSnapshot(signal?: AbortSignal): Promise<NetworkSnapshot>;
}
