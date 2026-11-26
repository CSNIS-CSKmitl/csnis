<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { fly } from 'svelte/transition';
  import { CheckCircle2, AlertCircle, Info, X } from 'lucide-svelte';
  import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
  import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
  import { toasts, toast } from '$lib/toast';

  let { children } = $props();
</script>

<SiteHeader />

<!-- Top-Center Animated Toast Notifications -->
<div
  class="fixed top-4 left-1/2 -translate-x-1/2 z-[120] flex flex-col items-center gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-md"
  aria-live="polite"
  aria-atomic="true"
>
  {#each $toasts as item (item.id)}
    <div
      transition:fly={{ y: -24, duration: 220 }}
      role={item.type === 'error' ? 'alert' : 'status'}
      class="pointer-events-auto flex items-center gap-2.5 w-full rounded-xl border px-4 py-3 text-xs font-medium shadow-lg backdrop-blur-md {item.type === 'success'
        ? 'border-emerald-200 bg-white/95 text-emerald-900'
        : item.type === 'error'
          ? 'border-red-200 bg-white/95 text-red-900'
          : 'border-slate-200 bg-white/95 text-slate-900'}"
    >
      {#if item.type === 'success'}
        <CheckCircle2 size={16} class="shrink-0 text-emerald-600" />
      {:else if item.type === 'error'}
        <AlertCircle size={16} class="shrink-0 text-red-600" />
      {:else}
        <Info size={16} class="shrink-0 text-blue-600" />
      {/if}

      <span class="flex-1 leading-snug">{item.message}</span>

      <button
        type="button"
        onclick={() => toast.dismiss(item.id)}
        class="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  {/each}
</div>

<main id="main" tabindex="-1" class="min-h-[calc(100vh-240px)]">
  {#key page.url.pathname}
    <div class="animate-page-enter">
      {@render children()}
    </div>
  {/key}
</main>

<SiteFooter />
