<script lang="ts">
  import { services } from '$lib/data/services';
  import ServiceCard from './ServiceCard.svelte';
</script>

<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

  {#each services as service (service.id)}

    <ServiceCard {service} />

  {/each}
</div>
