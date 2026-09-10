import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json() as { pin?: string };
        const adminPin = process.env.TOPOLOGY_ADMIN_PIN || '1234';

        if (!body || typeof body.pin !== 'string') {
            return json({ success: false, message: 'PIN is required.' }, { status: 400 });
        }

        if (body.pin.trim() === adminPin.trim()) {
            return json({ success: true, message: 'Authenticated successfully.' });
        } else {
            return json({ success: false, message: 'Invalid Admin PIN.' }, { status: 401 });
        }
    } catch {
        return json({ success: false, message: 'Malformed authentication request.' }, { status: 400 });
    }
};
