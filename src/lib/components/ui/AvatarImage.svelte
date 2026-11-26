<script lang="ts">
  let {
    src,
    alt,
    class: className = "",
  }: {
    src: string;
    alt: string;
    class?: string;
  } = $props();

  let loaded = $state(false);
  let errored = $state(false);
  let imgEl = $state<HTMLImageElement | null>(null);

  $effect(() => {
    // Reset loading state whenever src changes
    const _currentSrc = src;
    loaded = false;
    errored = false;

    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      loaded = true;
    }
  });
</script>

<span class="relative inline-block overflow-hidden bg-slate-100 {className}">
  {#if !loaded && !errored}
    <span
      class="absolute inset-0 animate-pulse bg-slate-200"
      aria-hidden="true"
    ></span>
  {/if}

  <img
    bind:this={imgEl}
    {src}
    {alt}
    loading="lazy"
    decoding="async"
    onload={() => (loaded = true)}
    onerror={() => {
      errored = true;
      loaded = true;
    }}
    class="size-full object-cover transition-opacity duration-200 {loaded
      ? 'opacity-100'
      : 'opacity-0'}"
  />
</span>
