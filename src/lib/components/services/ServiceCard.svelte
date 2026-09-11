<script lang="ts">
  import {
    CalendarDays,
    Globe,
    Printer,
    Terminal,
    ArrowUpRight,
    Info,
    Sparkles,
    CheckCircle2,
    X,
  } from "lucide-svelte";
  import type { Service } from "$lib/data/services";

  let {
    service,
  }: {
    service: Service;
  } = $props();

  const icons = {
    terminal: Terminal,
    printer: Printer,
    calendar: CalendarDays,
  };

  let Icon = $derived(icons[service.icon]);
  let isHovered = $state(false);
  let isOverlayPinned = $state(false);

  let isOverlayVisible = $derived(isHovered || isOverlayPinned);

  function togglePinned() {
    isOverlayPinned = !isOverlayPinned;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && isOverlayPinned) {
      isOverlayPinned = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<article
  id={service.id}
  class="panel service-card relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:bg-zinc-600/5 hover:shadow-xl hover:bg-zinc-300/5 min-h-[440px] overflow-hidden"
  role="region"
  aria-label={`บริการ ${service.name}`}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <!-- ======================================================== -->
  <!-- Base Card Content (Visible when overlay is inactive) -->
  <!-- ======================================================== -->
  <div
    class="flex flex-col flex-1 transition-opacity duration-200 {isOverlayVisible
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100'}"
  >
    <!-- Top Row: Icon + Category Badge -->
    <div class="flex items-start justify-between gap-3">
      <div
        class="icon-box transition-transform duration-300 group-hover:scale-105"
      >
        <Icon size={24} />
      </div>

      <span
        class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100"
      >
        {service.category}
      </span>
    </div>

    <!-- Title -->
    <h3 class="mt-5 text-xl font-bold text-slate-900 tracking-tight">
      {service.name}
    </h3>

    <!-- Short Description -->
    <p class="mt-2.5 text-sm text-slate-600 leading-relaxed">
      {service.shortDesc}
    </p>

    <!-- Key highlights preview -->
    <div class="mt-4 pt-3 border-t border-slate-100 space-y-2 flex-1">
      {#each service.highlights.slice(0, 2) as highlight}
        <div class="flex items-start gap-2 text-xs text-slate-500">
          <CheckCircle2 size={13} class="text-blue-500 shrink-0 mt-0.5" />
          <span class="line-clamp-2">{highlight}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Bottom Interactive Bar on Base Card -->
  <div
    class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 transition-opacity duration-200 {isOverlayVisible
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100'}"
  >
    <!-- Overlay trigger hint / button -->
    <!-- <button
      type="button"
      class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-[#F5EFE6] hover:bg-[#EFE7DC] px-2.5 py-1.5 rounded-lg border border-[#E6DDCE] transition-colors cursor-pointer"
      onclick={togglePinned}
      title="คลิกหรือชี้เมาส์เพื่อดูรายละเอียดเกี่ยวกับบริการนี้"
    >
      <Sparkles size={13} class="text-amber-700" />
      <span>เกี่ยวกับบริการนี้</span>
    </button> -->

    <!-- Direct link -->
    <a
      href={service.repository}
      target="_blank"
      rel="noopener noreferrer"
      class="text-link text-xs font-semibold inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
    >
      <Globe size={14} />
      <span>เข้าสู่ระบบ</span>
      <ArrowUpRight size={14} />
    </a>
  </div>

  <div
    class="service-overlay absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all duration-300 ease-out {isOverlayVisible
      ? 'opacity-100 translate-y-0 pointer-events-auto'
      : 'opacity-0 translate-y-3 pointer-events-none  '}"
  >
    <!-- Subtle Warm Ambient Glow -->
    <!-- <div
      class="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(238, 228, 212, 0.65) 0%, rgba(250, 247, 242, 0) 70%);"
    ></div> -->

    <!-- Overlay Header -->
    <div class="relative z-10">
      <div class="flex items-center justify-between gap-2">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFE8DC] text-[#635443] border border-[#DDD3C2]"
        >
          {service.category}
        </span>

        <div class="flex items-center gap-2">
          <!-- <span
            class="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#246A3B] bg-[#ECF5EE] border border-[#CEE4D2] px-2 py-0.5 rounded-full"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#246A3B] animate-pulse"
            ></span>
            {service.status}
          </span> -->

          {#if isOverlayPinned}
            <button
              type="button"
              class="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 transition-colors cursor-pointer"
              onclick={() => (isOverlayPinned = false)}
              aria-label="ปิดรายละเอียด"
            >
              <X size={15} />
            </button>
          {/if}
        </div>
      </div>

      <!-- Service Title with Icon -->
      <div class="flex items-center gap-2.5 mt-3.5">
        <div
          class="w-8 h-8 rounded-lg bg-[#EFE8DC] border border-[#DDD3C2] flex items-center justify-center text-[#554737] shrink-0 shadow-2xs"
        >
          <Icon size={17} />
        </div>
        <div>
          <h4
            class="text-lg font-bold text-[#201D1A] tracking-tight leading-tight"
          >
            {service.name}
          </h4>
        </div>
      </div>
    </div>

    <!-- Overlay Body: About & Highlights -->
    <div
      class="relative z-10 my-3 flex-1 flex flex-col justify-center space-y-2.5"
    >
      <div>
        <div
          class="text-[11px] font-bold uppercase tracking-wider text-[#825325] flex items-center gap-1.5 mb-1"
        >
          <Info size={13} />
          เกี่ยวกับบริการนี้
        </div>
        <p class="text-[12.5px] text-[#443E38] leading-relaxed font-normal">
          {service.about}
        </p>
      </div>

      <div class="space-y-1.5 pt-2 border-t border-[#E8E1D5]">
        <div
          class="text-[11px] font-bold uppercase tracking-wider text-[#796F63]"
        >
          ฟีเจอร์และจุดเด่นสำคัญ:
        </div>
        {#each service.highlights as highlight}
          <div class="flex items-start gap-2 text-[12px] text-[#2F2A25]">
            <CheckCircle2 size={13} class="text-[#246A3B] shrink-0 mt-0.5" />
            <span class="leading-tight">{highlight}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Overlay Footer: Action Button -->
    <div
      class="relative z-10 pt-3 border-t border-[#E8E1D5] flex flex-col gap-1.5"
    >
      <a
        href={service.repository}
        target="_blank"
        rel="noopener noreferrer"
        class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
      >
        <Globe size={14} />
        <span>เข้าสู่ระบบ {service.name}</span>
        <ArrowUpRight size={14} />
      </a>

      {#if isOverlayPinned}
        <button
          type="button"
          class="text-[11px] text-stone-500 hover:text-stone-700 text-center py-0.5 transition-colors cursor-pointer"
          onclick={() => (isOverlayPinned = false)}
        >
          แตะเพื่อปิด
        </button>
      {/if}
    </div>
  </div>
</article>

<style>
  .service-card {
    box-sizing: border-box;
  }
</style>
