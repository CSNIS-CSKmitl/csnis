import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import path from 'path';
import { saveUploadedFile } from '$lib/server/dataStore';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return json({ success: false, message: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return json({ success: false, message: 'ขนาดไฟล์เกิน 10MB กรุณาเลือกไฟล์ที่เล็กลง' }, { status: 400 });
        }

        // Validate file type
        const mimeType = file.type || '';
        const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        const isImage = validMimes.includes(mimeType) || Boolean(file.name.match(/\.(jpe?g|png|webp|gif|svg)$/i));
        
        if (!isImage) {
            return json({ success: false, message: 'รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP, GIF, SVG)' }, { status: 400 });
        }

        // Get safe extension
        let ext = path.extname(file.name).toLowerCase() || '.webp';
        if (!ext.startsWith('.')) ext = '.' + ext;

        // Generate clean unique filename
        const safeBase = file.name
            .replace(ext, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .substring(0, 30);
        const filename = `avatar-${safeBase || 'member'}-${Date.now()}${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const url = saveUploadedFile(filename, buffer);

        return json({
            success: true,
            url,
            filename,
            message: 'อัปโหลดรูปภาพสำเร็จ'
        });
    } catch (err) {
        console.error('Upload error:', err);
        return json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปโหลด: ' + (err as Error).message
        }, { status: 500 });
    }
};
