<script lang="ts">
  import type { NetworkSnapshot } from '$lib/monitoring/types';
  let { snapshot }: {
      snapshot: NetworkSnapshot;
  } = $props();
</script>

<div class="metric-grid mb-6" aria-label="Network summary">
  {#each [['Total devices',snapshot.devices.length,'In this topology'],['Online',snapshot.devices.filter(d=>d.status==='online').length,'Responding normally'],['Warning',snapshot.devices.filter(d=>d.status==='warning').length,'Needs attention'],['Offline',snapshot.devices.filter(d=>d.status==='offline').length,'Not responding']] as [label,value,hint]}
    <div class="metric panel">
      <small>{label}</small>
      <strong class:text-amber-600={label==='Warning'&&Number(value)>0}>{String(value).padStart(2,'0')}</strong>
      <p>{hint}</p>
    </div>
    {/each}
</div>
