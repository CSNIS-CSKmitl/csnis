<script lang="ts">
  import type { NetworkDevice } from '$lib/monitoring/types';
  import StatusBadge from './StatusBadge.svelte';
  let { device }: {
      device: NetworkDevice | undefined;
  } = $props();
</script>

<section class="panel p-6">
  <div class="eyebrow">Device details</div>
  {#if device}
    <div class="flex items-start justify-between gap-2">
      <h3>{device.name}</h3>
      <StatusBadge status={device.status}/>
    </div>
    <p class="mt-2 text-sm text-muted-foreground">{device.location}</p>
    <dl class="mt-6 space-y-4 text-sm">
      <div class="flex justify-between gap-4">
        <dt class="muted">Management IP</dt>
        <dd class="font-mono">{device.address}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="muted">Response time</dt>
        <dd>{device.latency} ms</dd>
      </div>
      <div class="flex justify-between">
        <dt class="muted">Utilization</dt>
        <dd>{device.utilization}%</dd>
      </div>
    </dl>
    <meter class="mt-3 w-full h-2" min="0" max="100" low="60" high="80" optimum="30" value={device.utilization} aria-label={`${device.name} utilization`}>{device.utilization}%</meter>
    {#if device.status==='warning'}
      <p class="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Utilization exceeds the 80% threshold.</p>
      {/if}
    {:else}
    <p class="muted">Select a device to view its details.</p>
    {/if}
</section>
