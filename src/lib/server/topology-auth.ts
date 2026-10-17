import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';

const COOKIE = 'csnis_topology_admin';
const MAX_AGE = 30 * 60;

function secret() {
	return process.env.TOPOLOGY_ADMIN_SESSION_SECRET || '';
}

function signature(expires: string) {
	return createHmac('sha256', secret()).update(expires).digest('hex');
}

export function setTopologySession(event: RequestEvent) {
	const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
	event.cookies.set(COOKIE, `${expires}.${signature(expires)}`, {
		path: '/api/monitoring', httpOnly: true, secure: event.url.protocol === 'https:', sameSite: 'strict', maxAge: MAX_AGE
	});
}

export function clearTopologySession(event: RequestEvent) {
	event.cookies.delete(COOKIE, { path: '/api/monitoring' });
}

export function hasTopologySession(event: RequestEvent) {
	const value = event.cookies.get(COOKIE) || '';
	const [expires, provided] = value.split('.');
	if (!secret() || !/^\d+$/.test(expires) || !provided || Number(expires) < Math.floor(Date.now() / 1000)) return false;
	const expected = signature(expires);
	if (provided.length !== expected.length) return false;
	return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export function verifyTopologyPin(pin: string) {
	const configured = process.env.TOPOLOGY_ADMIN_PIN || '';
	if (!configured || !pin) return false;
	const providedBuffer = Buffer.from(pin);
	const configuredBuffer = Buffer.from(configured);
	return providedBuffer.length === configuredBuffer.length && timingSafeEqual(providedBuffer, configuredBuffer);
}
