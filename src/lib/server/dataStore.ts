import fs from 'fs';
import path from 'path';
import { initialDevices } from '$lib/monitoring/mock';
import type { NetworkDevice, NetworkLink } from '$lib/monitoring/types';
import { defaultOrgChartData, type OrgChartData } from '$lib/data/orgChart';

export interface ServerTopologyData {
    devices: NetworkDevice[];
    links: NetworkLink[];
    mapConfig?: {
        mapWidth?: number;
        mapHeight?: number;
        isSizeLocked?: boolean;
    };
}

export const DATA_DIR = path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const TOPOLOGY_FILE = path.join(DATA_DIR, 'topology.json');
export const ORG_CHART_FILE = path.join(DATA_DIR, 'org-chart.json');

export const defaultTopology: ServerTopologyData = {
    devices: initialDevices,
    links: [
        { id: 'link-0', source: 'wan', target: 'vmbr0', capacity: '1 Gbps', status: 'online' },
        { id: 'link-1', source: 'vmbr0', target: 'opnsense', capacity: '10 Gbps', status: 'online' },
        { id: 'link-2', source: 'opnsense', target: 'vmbr1', capacity: '10 Gbps', status: 'online' },
        { id: 'link-3', source: 'vmbr1', target: 'dlink', capacity: '10 Gbps', status: 'online' },
        { id: 'link-4', source: 'dlink', target: 'wlc', capacity: '10 Gbps', status: 'online' },
        { id: 'link-5', source: 'vmbr1', target: 'servers', capacity: '10 Gbps', status: 'online' }
    ],
    mapConfig: { mapWidth: 600, mapHeight: 480, isSizeLocked: true }
};

export function ensureDataFilesExist(): void {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }

        // Check and create topology.json if missing or empty/invalid
        let needsTopology = false;
        if (!fs.existsSync(TOPOLOGY_FILE)) {
            needsTopology = true;
        } else {
            try {
                const content = fs.readFileSync(TOPOLOGY_FILE, 'utf-8').trim();
                if (!content) {
                    needsTopology = true;
                } else {
                    JSON.parse(content);
                }
            } catch {
                needsTopology = true;
            }
        }
        if (needsTopology) {
            saveServerTopology(defaultTopology);
            console.log('[CSNIS] Created missing data/topology.json');
        }

        // Check and create org-chart.json if missing or empty/invalid
        let needsOrgChart = false;
        if (!fs.existsSync(ORG_CHART_FILE)) {
            needsOrgChart = true;
        } else {
            try {
                const content = fs.readFileSync(ORG_CHART_FILE, 'utf-8').trim();
                if (!content) {
                    needsOrgChart = true;
                } else {
                    JSON.parse(content);
                }
            } catch {
                needsOrgChart = true;
            }
        }
        if (needsOrgChart) {
            saveServerOrgChart(defaultOrgChartData);
            console.log('[CSNIS] Created missing data/org-chart.json');
        }
    } catch (err) {
        console.error('[CSNIS] Error in ensureDataFilesExist:', err);
    }
}

export function loadServerTopology(): ServerTopologyData {
    try {
        if (fs.existsSync(TOPOLOGY_FILE)) {
            const raw = fs.readFileSync(TOPOLOGY_FILE, 'utf-8').trim();
            if (raw) {
                return JSON.parse(raw);
            }
        }
    } catch (err) {
        console.error('Error reading server topology file:', err);
    }
    // Automatically create topology.json with initial defaults if missing or corrupt
    saveServerTopology(defaultTopology);
    return defaultTopology;
}

export function saveServerTopology(data: ServerTopologyData): void {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(TOPOLOGY_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error writing server topology file:', err);
        throw err;
    }
}

export function loadServerOrgChart(): OrgChartData {
    try {
        if (fs.existsSync(ORG_CHART_FILE)) {
            const raw = fs.readFileSync(ORG_CHART_FILE, 'utf-8').trim();
            if (raw) {
                return JSON.parse(raw);
            }
        }
    } catch (err) {
        console.error('Error reading server org-chart file:', err);
    }
    // Automatically create org-chart.json with initial defaults if missing or corrupt
    saveServerOrgChart(defaultOrgChartData);
    return defaultOrgChartData;
}

export function saveServerOrgChart(data: OrgChartData): void {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(ORG_CHART_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error writing server org-chart file:', err);
        throw err;
    }
}

export function saveUploadedFile(filename: string, buffer: Buffer): string {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const safeName = path.basename(filename);
    const targetPath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(targetPath, buffer);

    // Also mirror to static/uploads if static folder exists (for dev server direct static asset access)
    try {
        const staticUploads = path.join(process.cwd(), 'static', 'uploads');
        if (!fs.existsSync(staticUploads)) {
            fs.mkdirSync(staticUploads, { recursive: true });
        }
        fs.writeFileSync(path.join(staticUploads, safeName), buffer);
    } catch (e) {
        // non-critical mirroring
    }

    return `/api/uploads/${safeName}`;
}

export function getUploadedFilePath(filename: string): string | null {
    const safeName = path.basename(filename);
    const targetPath = path.join(UPLOADS_DIR, safeName);
    if (fs.existsSync(targetPath)) {
        return targetPath;
    }
    // Fallback to static/uploads
    const staticPath = path.join(process.cwd(), 'static', 'uploads', safeName);
    if (fs.existsSync(staticPath)) {
        return staticPath;
    }
    return null;
}

// Automatically ensure files exist on import
ensureDataFilesExist();
