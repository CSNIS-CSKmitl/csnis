import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setTopologySession, verifyTopologyPin } from '$lib/server/topology-auth';

export const POST: RequestHandler = async (event) => {
    try {
        const body = await event.request.json() as { pin?: string };
        if (!body || typeof body.pin !== 'string') {
            return json({ success: false, message: 'PIN is required.' }, { status: 400 });
        }

        if (verifyTopologyPin(body.pin.trim())) {
            setTopologySession(event);
            return json({ success: true, message: 'Authenticated successfully.' });
        } else {
            return json({ success: false, message: 'Invalid Admin PIN.' }, { status: 401 });
        }
    } catch {
        return json({ success: false, message: 'Malformed authentication request.' }, { status: 400 });
    }
};
