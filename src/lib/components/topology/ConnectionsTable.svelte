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
          {@const sDev = snapshot.devices.find(d => d.id === link.source)}
          {@const tDev = snapshot.devices.find(d => d.id === link.target)}
          {@const linkOffline = link.status === 'offline' || sDev?.status === 'offline' || tDev?.status === 'offline'}
          <tr>
            <td>{sDev?.name || link.source}</td>
            <td>{tDev?.name || link.target}</td>
            <td>{link.capacity}</td>
            <td>
              <StatusBadge status={linkOffline ? 'offline' : 'online'} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
