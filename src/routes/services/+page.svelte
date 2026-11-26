<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ServiceGrid from "$lib/components/services/ServiceGrid.svelte";
</script>

<svelte:head>
  <title>Services — CSNIS</title>

  <meta
    name="description"
    content="บริการและโปรเจกต์ของ CSNIS: init.d, Printer-server, Booking, Borrowly, Announcements และ CSNIS Portal"
  />
  <script type="application/ld+json">
    {`{"@context":"https://schema.org","@type":"ItemList","name":"โปรเจกต์และบริการของ CSNIS","itemListElement":[{"@type":"ListItem","position":1,"name":"init.d","url":"https://init-d.cskmitl.com/"},{"@type":"ListItem","position":2,"name":"Printer-server","url":"https://printer.cskmitl.com/"},{"@type":"ListItem","position":3,"name":"Booking","url":"https://booking.cskmitl.com/"},{"@type":"ListItem","position":4,"name":"Borrowly","url":"https://req.cskmitl.com/"},{"@type":"ListItem","position":5,"name":"Announcements","url":"https://announcements.cskmitl.com/"},{"@type":"ListItem","position":6,"name":"CSNIS Portal","url":"https://csnis.cskmitl.com/"},{"@type":"ListItem","position":7,"name":"CSNIS Mobile API","url":"https://hub-api.cskmitl.com/"}]`}
  </script>
</svelte:head>

<div class="container">
  <PageHeader
    label="Our services"
    title="Services by CSNIS."
    description="บริการและโปรเจกต์ของทีม CSNIS พร้อมลิงก์รายละเอียดและเอกสารการใช้งาน"
  />

  <ServiceGrid />
</div>
