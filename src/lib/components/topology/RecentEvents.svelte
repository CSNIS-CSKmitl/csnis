<script lang="ts">
  import type { NetworkEvent } from '$lib/monitoring/types';
  import { CircleCheck, TriangleAlert, CircleX } from 'lucide-svelte';
  let { events }: {
      events: NetworkEvent[];
  } = $props();
</script>

<section class="panel p-6">
  <h3>Recent events</h3>
  <p class="mt-1 text-xs text-muted-foreground">Latest monitoring observations</p>
  <ul class="mt-5 space-y-5">
    {#each events as event (event.id)}
      <li class="flex items-start gap-3">
        {#if event.status==='offline'}
          <CircleX size={17} class="mt-1 shrink-0 text-red-600"/>
        {:else}
          <CircleCheck size={17} class="mt-1 shrink-0 text-green-600"/>
        {/if}
        <div>
          <p class="text-sm">{event.message}</p>
          <time datetime={event.timestamp} class="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString('en-GB')}</time>
        </div>
      </li>
      {:else}
      <li class="text-sm muted">No recent events.</li>
      {/each}
  </ul>
</section>
