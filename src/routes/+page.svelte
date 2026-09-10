<script lang="ts">
  import HomeHero from '$lib/components/home/HomeHero.svelte';
  import ServicesOverview from '$lib/components/home/ServicesOverview.svelte';
  import ContactCallout from '$lib/components/contact/ContactCallout.svelte';
</script>

<svelte:head>

  <title>CSNIS — Network Infrastructure</title>

  <meta name="description" content="CSNIS Network Infrastructure ดูแลระบบเครือข่ายและโครงสร้างพื้นฐาน เพื่อการเชื่อมต่อที่รวดเร็ว เสถียร และปลอดภัย" />
</svelte:head>

<HomeHero />

<ServicesOverview />

<section class="container section">

  <ContactCallout />
</section>
