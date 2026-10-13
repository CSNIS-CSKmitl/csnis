import type { Handle } from '@sveltejs/kit';
import { ensureDataFilesExist } from '$lib/server/dataStore';
import { writeServiceAudit } from '$lib/server/audit-log';

// Ensure data/topology.json and data/org-chart.json exist immediately upon server initialization
ensureDataFilesExist();

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    if (!event.url.pathname.startsWith('/_app') && event.url.pathname !== '/favicon.ico') {
        void writeServiceAudit(event, response.status);
    }
    return response;
};
