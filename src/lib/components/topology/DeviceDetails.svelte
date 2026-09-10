<script lang="ts">
  import type { NetworkDevice } from '$lib/monitoring/types';
  import StatusBadge from './StatusBadge.svelte';
  import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-svelte';

  let { device }: {
      device: NetworkDevice | undefined;
  } = $props();

  let pinging = $state(false);
  let pingResult = $state<{ latency?: number; status?: string; error?: string } | null>(null);

  async function runPingTest() {
    if (!device) return;
    pinging = true;
    pingResult = null;

    try {
      const res = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping', targetIp: device.address })
      });
      const data = await res.json();
      if (data.success) {
        pingResult = { latency: data.latency, status: data.status };
      } else {
        pingResult = { error: 'Ping timeout or unreachable' };
      }
    } catch {
      pingResult = { error: 'Failed to execute ping probe' };
    } finally {
      pinging = false;
    }
  }
</script>

<section class="panel p-6">
  <div class="eyebrow">Device details</div>
  {#if device}
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-semibold text-base text-slate-800">{device.name}</h3>
      <StatusBadge status={device.status}/>
    </div>
    <p class="mt-1 text-xs muted">{device.location}</p>
    <dl class="mt-5 space-y-3 text-xs">
      <div class="flex justify-between gap-4">
        <dt class="muted">Management IP</dt>
        <dd class="font-mono font-medium text-slate-800">{device.address}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="muted">Response time</dt>
        <dd class="font-medium text-slate-800">{device.latency} ms</dd>
      </div>
      <div class="flex justify-between">
        <dt class="muted">Utilization</dt>
        <dd class="font-medium text-slate-800">{device.utilization}%</dd>
      </div>
    </dl>

    <meter class="mt-3 w-full h-2 rounded overflow-hidden" min="0" max="100" low="60" high="80" optimum="30" value={device.utilization} aria-label={`${device.name} utilization`}>{device.utilization}%</meter>

    <!-- Ping Test Diagnostic Button -->
    <div class="mt-5 pt-4 border-t border-slate-100">
      <button
        onclick={runPingTest}
        disabled={pinging}
        class="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-60"
      >
        <Activity size={14} class={pinging ? 'animate-pulse text-blue-600' : 'text-slate-600'} />
        {pinging ? 'Pinging target…' : 'Run Live Ping Test'}
      </button>

      {#if pingResult}
        <div class="mt-3 rounded-md p-2.5 text-xs flex items-center gap-2 {pingResult.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}">
          {#if pingResult.error}
            <XCircle size={15} class="shrink-0 text-red-600" />
            <span>{pingResult.error}</span>
          {:else}
            <CheckCircle2 size={15} class="shrink-0 text-emerald-600" />
            <span>Probe Success: {pingResult.latency}ms ({pingResult.status})</span>
          {/if}
        </div>
      {/if}
    </div>

    {#if device.status==='warning'}
      <p class="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">Traffic utilization exceeds 80% threshold.</p>
    {/if}
  {:else}
    <p class="muted text-xs">Select a device to view details and diagnostics.</p>
  {/if}
</section>

