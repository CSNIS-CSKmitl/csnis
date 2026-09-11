<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ContactLocation from "$lib/components/contact/ContactLocation.svelte";
  import ManagementTree from "$lib/components/contact/ManagementTree.svelte";
</script>

<svelte:head>
  <title>Contact & Management Structure — CSNIS</title>

  <meta
    name="description"
    content="ติดต่อทีม CSNIS Network Infrastructure และผังโครงสร้างการบริหาร (Management Tree) ณ พระจอมเกล้า 713"
  />
</svelte:head>

<div class="container pb-16">
  <PageHeader
    label="Contact & Team"
    title="Meet the CSNIS team."
    description="โครงสร้างการบริหารทีมงาน CSNIS พร้อมช่องทางติดต่อและสถานที่ปฏิบัติงาน"
  />

  <!-- Management Hierarchy Tree Map -->
  <ManagementTree />

  <!-- Physical Location and Office -->
  <div class="mt-8">
    <ContactLocation />
  </div>
</div>
