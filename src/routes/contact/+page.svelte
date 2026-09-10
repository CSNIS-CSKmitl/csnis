<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ContactLocation from "$lib/components/contact/ContactLocation.svelte";
</script>

<svelte:head>
  <title>Contact — CSNIS</title>

  <meta
    name="description"
    content="ติดต่อทีม CSNIS Network Infrastructure ได้ที่ พระจอมเกล้า 713"
  />
</svelte:head>

<div class="container">
  <PageHeader
    label="Contact "
    title="Meet the CSNIS team."
    description="สอบถามเรื่องบริการ ปรึกษาปัญหาเครือข่าย หรือติดต่อทีมได้โดยตรง"
  />

  <ContactLocation />
</div>
