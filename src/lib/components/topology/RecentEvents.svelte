<script lang="ts">
	import type { NetworkEvent } from '$lib/monitoring/types';
	import type { OfflineIncident } from '$lib/monitoring-stats';
	import { CircleCheck, CircleX, History } from 'lucide-svelte';

	let {
		events,
		offlineHistory = []
	}: {
		events: NetworkEvent[];
		offlineHistory?: OfflineIncident[];
	} = $props();
</script>

<section class="panel p-6">
	<h3>Recent events & Offline history</h3>
	<p class="mt-1 text-xs text-muted-foreground">
		เหตุการณ์ตรวจสอบล่าสุดและประวัติการขาดการเชื่อมต่อ
	</p>

	{#if offlineHistory.length > 0}
		<div class="mt-4 rounded-lg border border-red-100 bg-red-50/40 p-3">
			<div class="flex items-center gap-1.5 text-xs font-semibold text-red-900">
				<History size={14} class="text-red-600" />
				<span>ประวัติ Offline ล่าสุด ({offlineHistory.length})</span>
			</div>
			<ul class="mt-2 space-y-2 text-xs">
				{#each offlineHistory.slice(0, 4) as incident (incident.id)}
					<li class="flex items-start justify-between gap-2 border-b border-red-100/70 pb-1.5 last:border-b-0 last:pb-0">
						<div>
							<p class="font-medium text-slate-800">{incident.deviceName}</p>
							<time datetime={incident.startedAt} class="text-[11px] text-slate-500 font-mono">
								{new Date(incident.startedAt).toLocaleString('th-TH', {
									hour: '2-digit',
									minute: '2-digit',
									day: 'numeric',
									month: 'short'
								})}
							</time>
						</div>
						<span
							class="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium {incident.ongoing
								? 'bg-red-100 text-red-800'
								: 'bg-emerald-100 text-emerald-800'}"
						>
							{incident.ongoing
								? 'กำลังออฟไลน์'
								: `แก้ไขแล้ว (${Math.max(1, Math.round(incident.durationMs / 60000))} นาที)`}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<ul class="mt-5 space-y-4">
		{#each events as event (event.id)}
			<li class="flex items-start gap-3">
				{#if event.status === 'offline'}
					<CircleX size={17} class="mt-1 shrink-0 text-red-600" />
				{:else}
					<CircleCheck size={17} class="mt-1 shrink-0 text-green-600" />
				{/if}
				<div>
					<p class="text-sm">{event.message}</p>
					<time datetime={event.timestamp} class="text-xs text-muted-foreground">
						{new Date(event.timestamp).toLocaleTimeString('en-GB')}
					</time>
				</div>
			</li>
		{:else}
			<li class="text-sm muted">No recent events.</li>
		{/each}
	</ul>
</section>
