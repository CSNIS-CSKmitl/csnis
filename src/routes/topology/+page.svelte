<script lang="ts">
  import NetworkSummary from '$lib/components/topology/NetworkSummary.svelte';
  import ConnectionsTable from '$lib/components/topology/ConnectionsTable.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { Network, Info } from 'lucide-svelte';
  import RefreshToolbar from '$lib/components/topology/RefreshToolbar.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import TopologyMap from '$lib/components/topology/TopologyMap.svelte';
  import DeviceDetails from '$lib/components/topology/DeviceDetails.svelte';
  import RecentEvents from '$lib/components/topology/RecentEvents.svelte';
  import StatusBadge from '$lib/components/topology/StatusBadge.svelte';
  import { createMockProvider } from '$lib/monitoring/mock';
  import { createPoller } from '$lib/monitoring/poller';
  import type { NetworkSnapshot } from '$lib/monitoring/types';
  let snapshot = $state<NetworkSnapshot | null>(null), selected = $state('core'), autoRefresh = $state(true), busy = $state(false), error = $state('');
  let poller: ReturnType<typeof createPoller> | undefined;
  let selectedDevice = $derived(snapshot?.devices.find(d => d.id === selected));
  function selectDevice(id: string) { selected = id; }
  onMount(() => {
      selected = page.url.searchParams.get('device') || 'core';
      poller = createPoller(createMockProvider(), { snapshot: data => { snapshot = data; error = ''; }, error: message => error = message, busy: value => busy = value });
      void poller.refresh();
      const lifecycle = new AbortController();
      const context = (document as Document & {
          modelContext?: {
              registerTool: (tool: unknown, options: {
                  signal: AbortSignal;
              }) => void | Promise<void>;
          };
      }).modelContext;
      if (context?.registerTool) {
          try {
              void Promise.resolve(context.registerTool({ name: 'select_network_device', title: 'Inspect network device', description: 'Select a CSNIS device and show its current details in the topology view.', inputSchema: { type: 'object', properties: { deviceId: { type: 'string' } }, required: ['deviceId'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input: unknown) { const id = (input as {
                      deviceId?: unknown;
                  })?.deviceId; if (typeof id !== 'string' || !snapshot?.devices.some(d => d.id === id))
                      throw new Error('Unknown network device.'); selectDevice(id); return snapshot.devices.find(d => d.id === id); } }, { signal: lifecycle.signal })).catch(() => { });
          }
          catch { /* Optional browser capability. */ }
      }
      return () => { poller?.dispose(); lifecycle.abort(); };
  });
</script>

<svelte:head>
  <title>Live Topology — CSNIS</title>
  <meta name="description" content="แผนผังเครือข่าย CSNIS พร้อมข้อมูลจำลองสถานะอุปกรณ์ สรุปเครือข่าย และเหตุการณ์ล่าสุด"/>
</svelte:head>

<div class="container">
  <PageHeader label="Network visibility" title="Live Topology" description="มองเห็นทุกการเชื่อมต่อ ติดตามสถานะ และตรวจสอบอุปกรณ์ในเครือข่าย"/>
  <RefreshToolbar
  {autoRefresh}
  {busy}
  onToggle={(checked) => { autoRefresh = checked; poller?.setPaused(!checked); }}
  onRefresh={() => { void poller?.refresh(); }}
/>

  {#if error}
    <div role="alert" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Unable to refresh. {snapshot?'Showing the last successful snapshot.':''} {error} Use Refresh now to retry.</div>
    {/if}

  {#if snapshot}
    <NetworkSummary {snapshot} />

    <div class="topology-layout">
      <section class="panel overflow-hidden">
        <div class="map-heading">
          <div>
            <h2 class="text-base flex items-center gap-2">
              <Network size={18} class="text-blue-700"/>
              Network map</h2>
            <p class="mt-1 text-xs muted">Select a device to inspect its details</p>
          </div>
          <span class="text-xs muted">Logical topology</span>
        </div>
        {#if snapshot.devices.length}
          <TopologyMap {snapshot} {selected} onselect={selectDevice}/>
          {:else}
          <p class="p-12 text-center muted">No devices are available from the monitoring source.</p>
          {/if}
        <div class="map-footer">
          <div class="flex flex-wrap gap-2">
            <StatusBadge status="online"/>
            <StatusBadge status="warning"/>
            <StatusBadge status="offline"/>
          </div>
          <time class="text-xs muted" datetime={snapshot.timestamp}>Last refresh {new Date(snapshot.timestamp).toLocaleTimeString('en-GB')}</time>
        </div>
      </section>
      <aside class="space-y-5">
        <DeviceDetails device={selectedDevice}/>
        <RecentEvents events={snapshot.events}/>
      </aside>
    </div>
    <div class="mt-5 flex items-start gap-2 text-xs muted">
      <Info size={15} class="shrink-0 mt-0.5"/>
      <p>ข้อมูลและ IP ทั้งหมดเป็นตัวอย่าง สถานะจำลองจะเปลี่ยนตามรอบรีเฟรช ไม่ใช่สถานะระบบจริง</p>
    </div>
    <ConnectionsTable {snapshot} />

{:else}
    <div class="panel p-16 text-center muted" role="status">{error?'Network data is unavailable. Use Refresh now to retry.':'Loading network topology…'}</div>
    {/if}
</div>

<style>
  .topology-layout {
    display: grid;
    grid-template-columns: minmax(0,1fr) 330px;
    gap: 22px;
  }
  .map-heading,.map-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
  }
  .map-heading {
    border-bottom: 1px solid #e2e8f0;
  }
  .map-footer {
    border-top: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }
  @media(max-width:1000px) {
    .topology-layout {
      grid-template-columns: minmax(0,1fr);
    }
    aside {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    aside>:global(*) {
      margin-top: 0!important;
    }
  }
  @media(max-width:650px) {
    aside {
      grid-template-columns: 1fr;
    }
    .map-heading {
      padding-inline: 18px;
    }
  }
</style>
