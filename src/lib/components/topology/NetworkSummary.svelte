<script lang="ts">
  import type { NetworkSnapshot } from '$lib/monitoring/types';
  let { snapshot }: {
      snapshot: NetworkSnapshot;
  } = $props();
</script>

<div class="metric-grid mb-6" aria-label="Network summary">
  {#each [['Total devices',snapshot.devices.length,'In this topology'],['Online',snapshot.devices.filter(d=>d.status==='online').length,'Responding normally'],['Offline',snapshot.devices.filter(d=>d.status==='offline').length,'Not responding']] as [label,value,hint]}
    <div class="metric panel">
      <small>{label}</small>
      <strong class:text-red-600={label==='Offline'&&Number(value)>0}>{String(value).padStart(2,'0')}</strong>
      <p>{hint}</p>
    </div>
    {/each}
</div>
