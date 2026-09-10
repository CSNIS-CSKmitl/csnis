<script lang="ts">
  let { label, title, description }: {
      label: string;
      title: string;
      description: string;
  } = $props();
</script>

<div class="page-head">
  <div class="eyebrow">{label}</div>
  <h1>{title}</h1>
  <p>{description}</p>
</div>
