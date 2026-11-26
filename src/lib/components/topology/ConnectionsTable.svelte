<script lang="ts">
	import type { NetworkSnapshot } from '$lib/monitoring/types';
	import {
		computeMonitoringStats,
		filterDevicesByDrilldown,
		type DeviceFilter,
		type StatsTimeRange
	} from '$lib/monitoring-stats';
	import StatusBadge from './StatusBadge.svelte';

	let {
		snapshot,
		activeFilter = 'all',
		timeRange = 'today',
		onSelectDevice
	}: {
		snapshot: NetworkSnapshot;
		activeFilter?: DeviceFilter;
		timeRange?: StatsTimeRange;
		onSelectDevice?: (deviceId: string) => void;
	} = $props();

	let stats = $derived(
		snapshot.stats && snapshot.stats.range === timeRange
			? snapshot.stats
			: computeMonitoringStats(snapshot, snapshot.samples ?? [], timeRange)
	);

	let filteredDevices = $derived(filterDevicesByDrilldown(snapshot.devices, activeFilter));
	let filteredDeviceIds = $derived(new Set(filteredDevices.map((d) => d.id)));

	let filteredLinks = $derived(
		activeFilter === 'all'
			? snapshot.links
			: snapshot.links.filter(
					(l) => filteredDeviceIds.has(l.source) || filteredDeviceIds.has(l.target)
				)
	);
</script>

<section class="panel mt-8 overflow-hidden">
	<div class="flex flex-wrap items-center justify-between gap-2 p-6">
		<div>
			<h2 class="text-lg">Devices & Connections Status</h2>
			<p class="text-xs text-slate-500 mt-1">
				ตารางสถานะอุปกรณ์ อัตราออนไลน์ (Uptime %) และการเชื่อมต่อสายสัญญาณ
				{activeFilter !== 'all' ? `(กรองเฉพาะ: ${activeFilter.toUpperCase()})` : ''}
			</p>
		</div>
		<span class="text-xs font-medium text-slate-600">
			แสดง {filteredDevices.length}/{snapshot.devices.length} อุปกรณ์ · {filteredLinks.length}/{snapshot
				.links.length} ลิงก์
		</span>
	</div>

	<div class="table-scroll border-t border-slate-100">
		<table>
			<caption class="sr-only">Network devices with uptime and latency statistics</caption>
			<thead>
				<tr>
					<th>Device</th>
					<th>IP / Interface</th>
					<th>Latency</th>
					<th>Utilization</th>
					<th>Uptime %</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredDevices as dev (dev.id)}
					{@const devStat = stats.deviceStats[dev.id]}
					{@const uptime = devStat ? devStat.uptimePct : dev.status === 'online' ? 100 : 0}
					<tr
						class="hover:bg-slate-50/80 cursor-pointer"
						onclick={() => onSelectDevice?.(dev.id)}
					>
						<td class="font-medium text-slate-800">{dev.name}</td>
						<td class="font-mono text-xs text-slate-600">{dev.address}</td>
						<td>{dev.latency} ms</td>
						<td>{dev.utilization}%</td>
						<td>
							<span
								class="inline-block rounded px-2 py-0.5 font-mono text-xs font-semibold {uptime >=
								99
									? 'bg-emerald-100 text-emerald-800'
									: uptime >= 90
										? 'bg-amber-100 text-amber-800'
										: 'bg-red-100 text-red-800'}"
							>
								{uptime}%
							</span>
						</td>
						<td>
							<StatusBadge status={dev.status} />
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="text-center text-slate-500 py-8">
							ไม่พบอุปกรณ์ที่ตรงกับตัวกรอง ({activeFilter})
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="p-6 pt-5 border-t border-slate-200 bg-slate-50/40">
		<h3 class="text-sm font-semibold text-slate-800">Network Links (Connections)</h3>
	</div>
	<div class="table-scroll">
		<table>
			<caption class="sr-only">Network links and their current sample status</caption>
			<thead>
				<tr>
					<th>Source</th>
					<th>Destination</th>
					<th>Capacity</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredLinks as link (link.id)}
					{@const sDev = snapshot.devices.find((d) => d.id === link.source)}
					{@const tDev = snapshot.devices.find((d) => d.id === link.target)}
					{@const linkOffline =
						link.status === 'offline' ||
						sDev?.status === 'offline' ||
						tDev?.status === 'offline'}
					<tr>
						<td>{sDev?.name || link.source}</td>
						<td>{tDev?.name || link.target}</td>
						<td>{link.capacity}</td>
						<td>
							<StatusBadge status={linkOffline ? 'offline' : 'online'} />
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="text-center text-slate-500 py-6">
							ไม่พบสายสัญญาณที่ตรงกับตัวกรอง
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
