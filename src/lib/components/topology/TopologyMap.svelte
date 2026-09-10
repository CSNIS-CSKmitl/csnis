<script lang="ts">
  import type { NetworkSnapshot } from '$lib/monitoring/types';
  import TopologyNode from './TopologyNode.svelte';
  let { snapshot, selected, onselect }: {
      snapshot: NetworkSnapshot;
      selected: string;
      onselect: (id: string) => void;
  } = $props();
</script>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access is required to scroll the wide topology region.) -->

<div class="map-scroll" role="region" aria-label="Network topology diagram. Scroll horizontally on small screens." tabindex="0">
  <div class="map">
    <svg viewBox="0 0 600 480" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="topology-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#dce3ec"/>
        </pattern>
      </defs>
      <rect width="600" height="480" fill="url(#topology-grid)"/>
      {#each snapshot.links as link}
        {@const from=snapshot.devices.find(d=>d.id===link.source)}
        {@const to=snapshot.devices.find(d=>d.id===link.target)}
        {#if from&&to}
          <path d={from.y===to.y?`M${from.x} ${from.y} H${to.x}`:`M${from.x} ${from.y} V${(from.y+to.y)/2} H${to.x} V${to.y}`} fill="none" stroke={link.status==='warning'?'#d97706':link.status==='offline'?'#dc2626':'#9aafd0'} stroke-width="1.5" stroke-dasharray={link.status==='offline'?'5 4':undefined}/>
          {/if}
        {/each}
    </svg>
    {#each snapshot.devices as device (device.id)}
      <TopologyNode {device} selected={selected===device.id} {onselect}/>
      {/each}
  </div>
</div>

<style>
  .map-scroll {
    overflow-x: auto;
  }
  .map {
    height: 480px;
    min-width: 610px;
    position: relative;
    background: #fcfdff;
  }
  .map svg {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
</style>
