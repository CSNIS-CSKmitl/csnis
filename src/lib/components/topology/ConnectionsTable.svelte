<script lang="ts">
  import type { NetworkSnapshot } from '$lib/monitoring/types';
  import StatusBadge from './StatusBadge.svelte';
  let { snapshot }: {
      snapshot: NetworkSnapshot;
  } = $props();
</script>

<section class="panel mt-8 overflow-hidden">
  <div class="p-6">
    <h2 class="text-lg">Connections</h2>
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
        {#each snapshot.links as link}
          <tr>
            <td>{snapshot.devices.find(d=>d.id===link.source)?.name}</td>
            <td>{snapshot.devices.find(d=>d.id===link.target)?.name}</td>
            <td>{link.capacity}</td>
            <td>
              <StatusBadge status={link.status}/>
            </td>
          </tr>
          {/each}
      </tbody>
    </table>
  </div>
</section>
