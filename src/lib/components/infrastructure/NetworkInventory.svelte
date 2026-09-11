<script lang="ts">
  import StatusBadge from "$lib/components/topology/StatusBadge.svelte";
  import type { NetworkDevice } from "$lib/monitoring/types";

  let { devices = [] }: { devices: NetworkDevice[] } = $props();
</script>

<section class="mt-10 panel overflow-hidden">
  <div class="p-6">
    <h2 class="text-xl">Network inventory</h2>
    <p class="mt-2 text-sm muted">รายการอุปกรณ์ทั้งหมดในระบบ</p>
  </div>
  <div class="table-scroll">
    <table>
      <caption class="sr-only"
        >CSNIS network devices and live monitoring status</caption
      >
      <thead>
        <tr>
          <th>Device</th>
          <th>Management IP</th>
          <th>Network zone</th>
          <th>Sample status</th>
        </tr>
      </thead>
      <tbody>
        {#each devices as device}
          <tr>
            <td class="font-medium">
              <a
                class="hover:text-blue-700"
                href={"/topology/?device=" + device.id}>{device.name}</a
              >
            </td>
            <td class="font-mono text-xs">{device.address}</td>
            <td class="muted">{device.location}</td>
            <td>
              <StatusBadge status={device.status} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
