import type { Handle } from '@sveltejs/kit';
import { ensureDataFilesExist } from '$lib/server/dataStore';

// Ensure data/topology.json and data/org-chart.json exist immediately upon server initialization
ensureDataFilesExist();

export const handle: Handle = async ({ event, resolve }) => {
    return resolve(event);
};
