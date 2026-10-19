<script lang="ts">
  import '../app.css';
  import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
  import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
  import LegalConsent from '$lib/components/LegalConsent.svelte';
  import AnnouncementCenter from '$lib/components/AnnouncementCenter.svelte';
  let { children } = $props();
</script>

<SiteHeader />
<AnnouncementCenter />

<svelte:head>
  <meta name="author" content="เตชสิทธิ์ วาณิชภัทรกุล" />
  <meta name="creator" content="เตชสิทธิ์ วาณิชภัทรกุล" />
  <script type="application/ld+json">
    {`{"@context":"https://schema.org","@type":"Person","@id":"https://csnis.cskmitl.com/#techasit-vanitpattarakul","name":"เตชสิทธิ์ วาณิชภัทรกุล","alternateName":"Techasit Vanitpattarakul","url":"https://csnis.cskmitl.com/","sameAs":["https://github.com/techasit5415"],"worksFor":{"@type":"Organization","name":"CSNIS · CS KMITL"}}`}
  </script>
</svelte:head>

<main id="main" tabindex="-1" class="min-h-[calc(100vh-240px)]">

  {@render children()}
</main>

<SiteFooter />
<LegalConsent enabled={false} />
