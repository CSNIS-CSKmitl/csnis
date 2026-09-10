<script lang="ts">
  import '../app.css';
  import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
  import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
  let { children } = $props();
</script>

<SiteHeader />

<main id="main" tabindex="-1" class="min-h-[calc(100vh-240px)]">

  {@render children()}
</main>

<SiteFooter />
