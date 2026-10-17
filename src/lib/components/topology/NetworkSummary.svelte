<script lang="ts">
	import type { NetworkSnapshot } from '$lib/monitoring/types';
	import {
		computeMonitoringStats,
		TIME_RANGE_OPTIONS,
		type DeviceFilter,
		type MonitoringStatsSummary,
		type StatsTimeRange
	} from '$lib/monitoring-stats';
	import {
		Activity,
		AlertTriangle,
		CheckCircle2,
		Clock,
		Filter,
		Radio,
		RefreshCw,
		Server,
		TrendingUp,
		XCircle
	} from 'lucide-svelte';

	let {
		snapshot,
		timeRange = 'today',
		activeFilter = 'all',
		busy = false,
		autoRefresh = true,
		onRangeChange,
		onFilterChange,
		onSelectDevice,
		onRefresh
	}: {
		snapshot: NetworkSnapshot;
		timeRange?: StatsTimeRange;
		activeFilter?: DeviceFilter;
		busy?: boolean;
		autoRefresh?: boolean;
		onRangeChange?: (range: StatsTimeRange) => void;
		onFilterChange?: (filter: DeviceFilter) => void;
		onSelectDevice?: (deviceId: string) => void;
		onRefresh?: () => void;
	} = $props();

	let stats: MonitoringStatsSummary = $derived(
		snapshot.stats && snapshot.stats.range === timeRange
			? snapshot.stats
			: computeMonitoringStats(snapshot, snapshot.samples ?? [], timeRange)
	);

	let formattedUpdated = $derived.by(() => {
		const ms = Date.parse(snapshot.timestamp);
		if (!Number.isFinite(ms)) return 'ไม่ทราบเวลา';
		return new Date(ms).toLocaleTimeString('th-TH', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	});

	let maxTrendLatency = $derived(
		Math.max(20, ...stats.trend.map((pt) => pt.avgLatencyMs || 0))
	);

	function toggleFilter(next: DeviceFilter) {
		if (!onFilterChange) return;
		onFilterChange(activeFilter === next && next !== 'all' ? 'all' : next);
	}
</script>

<section class="mb-6 space-y-4" aria-label="Network summary and statistics">
	<!-- Top Statistics Header: Realtime Badge, Last Updated, Time Range Selector, Refresh -->
	<div
		class="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="flex flex-wrap items-center gap-2.5">
			<!-- Realtime / Polling / Snapshot Status Badge -->
			<span
				class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold {snapshot.source ===
					'api' && autoRefresh
					? 'border-emerald-200 bg-emerald-50 text-emerald-700'
					: 'border-blue-200 bg-blue-50 text-blue-700'}"
			>
				<Radio
					size={13}
					class={autoRefresh ? 'animate-pulse text-emerald-600' : 'text-blue-600'}
				/>
				{#if snapshot.source === 'api'}
					{autoRefresh ? 'Realtime Polling' : 'API Snapshot'}
				{:else}
					{autoRefresh ? 'Simulated Live' : 'Mock Snapshot'}
				{/if}
			</span>

			<span class="inline-flex items-center gap-1.5 text-xs text-slate-600">
				<Clock size={13} class="text-slate-400" />
				<span>อัปเดตล่าสุด:</span>
				<time datetime={snapshot.timestamp} class="font-mono font-semibold text-slate-800">
					{formattedUpdated}
				</time>
			</span>

			{#if onRefresh}
				<button
					type="button"
					onclick={onRefresh}
					disabled={busy}
					class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
				>
					<RefreshCw size={12} class={busy ? 'animate-spin text-blue-600' : ''} />
					<span>{busy ? 'กำลังรีเฟรช…' : 'รีเฟรช'}</span>
				</button>
			{/if}
		</div>

		<!-- Time Range Filter Selector -->
		<div
			class="flex flex-wrap items-center gap-1.5"
			role="group"
			aria-label="เลือกช่วงเวลาสถิติ (Time range)"
		>
			<span class="mr-1 text-xs font-medium text-slate-500">ช่วงเวลา:</span>
			{#each TIME_RANGE_OPTIONS as option (option.value)}
				<button
					type="button"
					aria-pressed={timeRange === option.value}
					onclick={() => onRangeChange?.(option.value)}
					class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors {timeRange ===
					option.value
						? 'bg-blue-600 text-white shadow-xs'
						: 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Clickable Summary Stat Cards (Drill-down) -->
	<div class="metric-grid" role="group" aria-label="ตัวกรองสถานะอุปกรณ์ (Drill-down cards)">
		<button
			type="button"
			aria-pressed={activeFilter === 'all'}
			onclick={() => toggleFilter('all')}
			class="metric panel text-left transition-all hover:border-blue-300 {activeFilter === 'all'
				? 'ring-2 ring-blue-600 border-blue-500 bg-blue-50/20'
				: ''}"
		>
			<div class="flex items-center justify-between">
				<small class="font-medium">Total devices (ทั้งหมด)</small>
				<Server size={16} class="text-blue-600" />
			</div>
			<strong>{String(stats.totalDevices).padStart(2, '0')}</strong>
			<p>คลิกเพื่อแสดงอุปกรณ์ทั้งหมดในผัง</p>
		</button>

		<button
			type="button"
			aria-pressed={activeFilter === 'online'}
			onclick={() => toggleFilter('online')}
			class="metric panel text-left transition-all hover:border-emerald-300 {activeFilter ===
			'online'
				? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-50/20'
				: ''}"
		>
			<div class="flex items-center justify-between">
				<small class="font-medium">Online (ออนไลน์)</small>
				<CheckCircle2 size={16} class="text-emerald-600" />
			</div>
			<strong class="text-emerald-700">{String(stats.onlineDevices).padStart(2, '0')}</strong>
			<p>ตอบสนองปกติ · Uptime เฉลี่ย {stats.overallUptimePct}%</p>
		</button>

		<button
			type="button"
			aria-pressed={activeFilter === 'offline'}
			onclick={() => toggleFilter('offline')}
			class="metric panel text-left transition-all hover:border-red-300 {activeFilter === 'offline'
				? 'ring-2 ring-red-600 border-red-500 bg-red-50/20'
				: ''}"
		>
			<div class="flex items-center justify-between">
				<small class="font-medium">Offline (ออฟไลน์)</small>
				<XCircle size={16} class={stats.offlineDevices > 0 ? 'text-red-600' : 'text-slate-400'} />
			</div>
			<strong class:text-red-600={stats.offlineDevices > 0}>
				{String(stats.offlineDevices).padStart(2, '0')}
			</strong>
			<p>ไม่ตอบสนอง · ประวัติหลุด {stats.offlineHistory.length} ครั้ง</p>
		</button>

		<button
			type="button"
			aria-pressed={activeFilter === 'degraded'}
			onclick={() => toggleFilter('degraded')}
			class="metric panel text-left transition-all hover:border-amber-300 {activeFilter ===
			'degraded'
				? 'ring-2 ring-amber-600 border-amber-500 bg-amber-50/20'
				: ''}"
		>
			<div class="flex items-center justify-between">
				<small class="font-medium">Degraded / High Load</small>
				<AlertTriangle
					size={16}
					class={stats.degradedDevices > 0 ? 'text-amber-600' : 'text-slate-400'}
				/>
			</div>
			<strong class:text-amber-600={stats.degradedDevices > 0}>
				{String(stats.degradedDevices).padStart(2, '0')}
			</strong>
			<p>Latency เฉลี่ย {stats.avgLatencyMs} ms · โหลด {stats.avgUtilization}%</p>
		</button>
	</div>

	{#if activeFilter !== 'all'}
		<div
			class="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs text-blue-900"
		>
			<span class="flex items-center gap-1.5 font-medium">
				<Filter size={13} class="text-blue-700" />
				กำลังกรองเฉพาะอุปกรณ์สถานะ:
				<strong class="uppercase">{activeFilter}</strong>
			</span>
			<button
				type="button"
				onclick={() => onFilterChange?.('all')}
				class="font-semibold text-blue-700 underline hover:text-blue-900"
			>
				ล้างตัวกรอง (แสดงทั้งหมด)
			</button>
		</div>
	{/if}

	<!-- Trend Chart & Per-Device Uptime Breakdown -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
		<!-- Trend Chart Panel -->
		<div class="panel p-5 lg:col-span-7">
			<div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
				<div>
					<h3 class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
						<TrendingUp size={15} class="text-blue-600" />
						แนวโน้มความเสถียรและเวลาตอบสนอง (Uptime & Latency Trend)
					</h3>
					<p class="text-xs text-slate-500 mt-0.5">
						คำนวณจาก {stats.totalSamples} ตัวอย่างข้อมูล · ลิงก์ทำงานปกติ {stats.onlineLinks}/{stats.onlineLinks +
							stats.offlineLinks} เส้น
					</p>
				</div>
				<div class="flex items-center gap-3 text-[11px] font-medium text-slate-600">
					<span class="inline-flex items-center gap-1">
						<span class="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-500"></span>
						Uptime %
					</span>
					<span class="inline-flex items-center gap-1">
						<span class="inline-block h-2.5 w-2.5 rounded-xs bg-blue-600"></span>
						Latency (ms)
					</span>
				</div>
			</div>

			{#if stats.trend.length > 0}
				<div class="mt-4">
					<div
						class="grid items-end gap-1.5 h-32 pt-2 px-1"
						style:grid-template-columns={`repeat(${stats.trend.length}, minmax(0, 1fr))`}
						role="img"
						aria-label="กราฟแนวโน้ม Uptime และ Latency ตามช่วงเวลา"
					>
						{#each stats.trend as point (point.bucket)}
							{@const latencyHeightPct = Math.min(
								100,
								Math.max(10, Math.round((point.avgLatencyMs / maxTrendLatency) * 100))
							)}
							<div
								class="group relative flex flex-col items-center justify-end h-full gap-1"
								title={`${point.label} — Online ${point.onlinePct}% | Latency ${point.avgLatencyMs}ms`}
							>
								<div class="w-full flex items-end justify-center gap-0.5 h-24">
									<div
										class="w-1/2 rounded-t transition-all {point.offlineCount > 0
											? 'bg-amber-500'
											: 'bg-emerald-500'}"
										style:height={`${Math.max(8, Math.round(point.onlinePct))}%`}
									></div>
									<div
										class="w-1/2 rounded-t bg-blue-600/85 transition-all"
										style:height={`${latencyHeightPct}%`}
									></div>
								</div>
								<span class="text-[10px] text-slate-500 font-mono truncate max-w-full">
									{point.label}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<p class="py-10 text-center text-xs text-slate-500">
					ยังไม่มีข้อมูลแนวโน้มสำหรับช่วงเวลานี้
				</p>
			{/if}
		</div>

		<!-- Per-Device Uptime % Summary -->
		<div class="panel p-5 lg:col-span-5">
			<div class="flex items-center justify-between pb-3 border-b border-slate-100">
				<div>
					<h3 class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
						<Activity size={15} class="text-emerald-600" />
						อัตราออนไลน์รายอุปกรณ์ (Per-Device Uptime)
					</h3>
					<p class="text-xs text-slate-500 mt-0.5">คลิกชื่ออุปกรณ์เพื่อดูรายละเอียดเชิงลึก</p>
				</div>
				<span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
					เฉลี่ย {stats.overallUptimePct}%
				</span>
			</div>

			<div class="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
				{#each snapshot.devices as dev (dev.id)}
					{@const devStat = stats.deviceStats[dev.id]}
					{@const uptime = devStat ? devStat.uptimePct : dev.status === 'online' ? 100 : 0}
					<button
						type="button"
						onclick={() => onSelectDevice?.(dev.id)}
						class="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-1.5 text-left text-xs hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
					>
						<div class="min-w-0 flex-1">
							<div class="font-medium text-slate-800 truncate">{dev.name}</div>
							<div class="text-[11px] text-slate-500 font-mono">
								{dev.latency} ms · Load {dev.utilization}%
							</div>
						</div>
						<div class="text-right shrink-0">
							<span
								class="inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold {uptime >=
								99
									? 'bg-emerald-100 text-emerald-800'
									: uptime >= 90
										? 'bg-amber-100 text-amber-800'
										: 'bg-red-100 text-red-800'}"
							>
								{uptime}%
							</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
</section>
