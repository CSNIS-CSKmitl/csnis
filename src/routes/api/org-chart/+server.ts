import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { defaultOrgChartData, type OrgChartData } from '$lib/data/orgChart';
import { loadServerOrgChart, saveServerOrgChart } from '$lib/server/dataStore';

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
