import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { defaultOrgChartData, type OrgChartData } from '$lib/data/orgChart';
import fs from 'fs';
import path from 'path';

const ORG_CHART_FILE = path.join(process.cwd(), 'data', 'org-chart.json');

function loadServerOrgChart(): OrgChartData {
    try {
        if (fs.existsSync(ORG_CHART_FILE)) {
            const raw = fs.readFileSync(ORG_CHART_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.error('Error reading server org-chart file:', err);
    }
    return defaultOrgChartData;
}

function saveServerOrgChart(data: OrgChartData) {
    try {
        const dir = path.dirname(ORG_CHART_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(ORG_CHART_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error writing server org-chart file:', err);
        throw err;
    }
}

export const GET: RequestHandler = async () => {
    const data = loadServerOrgChart();
    return json(data);
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json() as {
            action?: string;
            chart?: OrgChartData['chart'];
            retiredMembers?: OrgChartData['retiredMembers'];
        };

        if (body.action === 'save_org_chart') {
            if (body.chart && Array.isArray(body.retiredMembers)) {
                const updatedData: OrgChartData = {
                    chart: body.chart,
                    retiredMembers: body.retiredMembers,
                    lastUpdated: new Date().toISOString()
                };
                saveServerOrgChart(updatedData);
                return json({
                    success: true,
                    message: 'บันทึกข้อมูลผังการบริหารลงบนเซิร์ฟเวอร์ (Server JSON Storage) สำเร็จ!',
                    data: updatedData
                });
            }
            return json({ success: false, message: 'ข้อมูลไม่สมบูรณ์: จำเป็นต้องมี chart และ retiredMembers' }, { status: 400 });
        }

        if (body.action === 'reset_org_chart') {
            saveServerOrgChart(defaultOrgChartData);
            return json({
                success: true,
                message: 'รีเซ็ตผังการบริหารกลับเป็นค่าเริ่มต้นบนเซิร์ฟเวอร์เรียบร้อยแล้ว',
                data: defaultOrgChartData
            });
        }

        return json({ success: false, message: 'Invalid action specified.' }, { status: 400 });
    } catch (err) {
        return json({
            success: false,
            message: 'Failed to process request: ' + (err as Error).message
        }, { status: 500 });
    }
};
