#!/usr/bin/env node
/**
 * Setup PocketBase `monitoring_samples` collection for CSNIS Portal statistics.
 * Usage: npm run setup:stats-db
 */
import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile() {
	const envPath = path.resolve(process.cwd(), '.env');
	if (!fs.existsSync(envPath)) return;
	const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eqIndex = trimmed.indexOf('=');
		if (eqIndex === -1) continue;
		const key = trimmed.slice(0, eqIndex).trim();
		const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
		if (key && !(key in process.env)) {
			process.env[key] = value;
		}
	}
}

loadEnvFile();

const pbUrl = (
	process.env.PRIVATE_POCKETBASE_URL ||
	process.env.POCKETBASE_URL ||
	'http://127.0.0.1:8090'
).replace(/\/$/, '');
const adminEmail = process.env.PB_ADMIN_EMAIL || '';
const adminPassword = process.env.PB_ADMIN_PASSWORD || '';

const COLLECTION_SCHEMA = {
	name: 'monitoring_samples',
	type: 'base',
	listRule: '@request.auth.id != ""',
	viewRule: '@request.auth.id != ""',
	createRule: null,
	updateRule: null,
	deleteRule: null,
	fields: [
		{
			name: 'device_id',
			type: 'text',
			required: true,
			min: 1,
			max: 120
		},
		{
			name: 'device_name',
			type: 'text',
			required: true,
			min: 1,
			max: 200
		},
		{
			name: 'kind',
			type: 'text',
			required: false,
			max: 64
		},
		{
			name: 'status',
			type: 'select',
			required: true,
			maxSelect: 1,
			values: ['online', 'offline']
		},
		{
			name: 'latency_ms',
			type: 'number',
			required: false,
			min: 0
		},
		{
			name: 'utilization',
			type: 'number',
			required: false,
			min: 0,
			max: 100
		},
		{
			name: 'checked_at',
			type: 'date',
			required: true
		},
		{
			name: 'created',
			type: 'autodate',
			onCreate: true,
			onUpdate: false
		},
		{
			name: 'updated',
			type: 'autodate',
			onCreate: true,
			onUpdate: true
		}
	],
	indexes: [
		'CREATE INDEX idx_monitoring_samples_device_checked ON monitoring_samples (device_id, checked_at)',
		'CREATE INDEX idx_monitoring_samples_status_checked ON monitoring_samples (status, checked_at)'
	]
};

async function authenticate() {
	if (!adminEmail || !adminPassword) {
		throw new Error(
			'Missing PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD environment variables. Configure them in .env first.'
		);
	}

	const endpoints = [
		`${pbUrl}/api/collections/_superusers/auth-with-password`,
		`${pbUrl}/api/admins/auth-with-password`
	];

	for (const endpoint of endpoints) {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ identity: adminEmail, password: adminPassword })
		});
		if (res.ok) {
			const data = await res.json();
			if (data?.token) return data.token;
		}
	}

	throw new Error(`Unable to authenticate against PocketBase at ${pbUrl}`);
}

async function ensureCollection(token) {
	const headers = {
		Authorization: token,
		'Content-Type': 'application/json'
	};

	const legacyRes = await fetch(`${pbUrl}/api/collections/CSNIS`, { headers });
	if (legacyRes.ok) {
		const legacyCol = await legacyRes.json();
		const recordsRes = await fetch(`${pbUrl}/api/collections/CSNIS/records?perPage=1`, { headers });
		const recordsData = recordsRes.ok ? await recordsRes.json() : { totalItems: 1 };
		if (recordsData.totalItems === 0) {
			await fetch(`${pbUrl}/api/collections/${legacyCol.id}`, { method: 'DELETE', headers });
			console.log('[CSNIS] Removed empty misnamed collection: CSNIS');
		}
	}

	const checkRes = await fetch(`${pbUrl}/api/collections/monitoring_samples`, { headers });
	if (checkRes.ok) {
		const existing = await checkRes.json();
		const updateRes = await fetch(`${pbUrl}/api/collections/${existing.id}`, {
			method: 'PATCH',
			headers,
			body: JSON.stringify(COLLECTION_SCHEMA)
		});
		if (!updateRes.ok) {
			const errText = await updateRes.text();
			throw new Error(`Failed to update monitoring_samples collection: ${errText}`);
		}
		console.log('[CSNIS] Updated PocketBase collection: monitoring_samples');
		return;
	}

	const createRes = await fetch(`${pbUrl}/api/collections`, {
		method: 'POST',
		headers,
		body: JSON.stringify(COLLECTION_SCHEMA)
	});
	if (!createRes.ok) {
		const errText = await createRes.text();
		throw new Error(`Failed to create monitoring_samples collection: ${errText}`);
	}
	console.log('[CSNIS] Created PocketBase collection: monitoring_samples');
}

async function main() {
	try {
		const token = await authenticate();
		await ensureCollection(token);
	} catch (err) {
		console.error('[CSNIS setup:stats-db]', err instanceof Error ? err.message : err);
		process.exitCode = 1;
	}
}

await main();
