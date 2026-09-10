<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import ServiceGrid from '$lib/components/services/ServiceGrid.svelte';
  import ContactCallout from '$lib/components/contact/ContactCallout.svelte';
</script>

<svelte:head>

  <title>Services — CSNIS</title>

  <meta name="description" content="บริการและโปรเจกต์ของ CSNIS: init.d, Printer-server และ Booking" />
</svelte:head>

<div class="container">

  <PageHeader
    label="Our services"
    title="Services by CSNIS."
    description="บริการและโปรเจกต์ของทีม CSNIS พร้อมลิงก์รายละเอียดและเอกสารการใช้งาน"
  />

  <ServiceGrid />

  <div class="mt-12">
    <ContactCallout />
  </div>
</div>
