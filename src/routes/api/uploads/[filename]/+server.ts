import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import { getUploadedFilePath } from '$lib/server/dataStore';

const MIME_TYPES: Record<string, string> = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

export const GET: RequestHandler = async ({ params }) => {
    const filename = params.filename;
    if (!filename) {
        return new Response('Not Found', { status: 404 });
    }

    const filePath = getUploadedFilePath(filename);
    if (!filePath) {
        return new Response('File Not Found', { status: 404 });
    }

    try {
        const ext = path.extname(filename).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        const fileBuffer = fs.readFileSync(filePath);

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': mime,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch {
        return new Response('Error reading file', { status: 500 });
    }
};
