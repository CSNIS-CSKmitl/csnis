<script lang="ts">
  import type { NetworkSnapshot } from "$lib/monitoring/types";
  import TopologyNode from "./TopologyNode.svelte";
  import { Lock, Unlock, MoveHorizontal, Maximize2 } from "lucide-svelte";

  let {
    snapshot,
    selected,
    editMode = false,
    onselect,
    onmove,
    onconnectlink,
    ondeletelink,
  }: {
    snapshot: NetworkSnapshot;
    selected: string;
    editMode?: boolean;
    onselect: (id: string) => void;
    onmove?: (
      id: string,
      x: number,
      y: number,
      width?: number,
      height?: number,
    ) => void;
    onconnectlink?: (sourceId: string, targetId: string) => void;
    ondeletelink?: (linkId: string) => void;
  } = $props();

  const MAP_CONFIG_KEY = "csnis_map_config_v2";

  let mapEl: HTMLDivElement | undefined = $state();
  let draggingId = $state<string | null>(null);

  // Drag-to-connect cable state
  let connectingFromId = $state<string | null>(null);
  let mousePos = $state<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node resize state
  let resizingId = $state<string | null>(null);
  let resizeStartPos = $state<{
    mouseX: number;
    mouseY: number;
    startW: number;
    startH: number;
  }>({ mouseX: 0, mouseY: 0, startW: 158, startH: 100 });

  // Map Container canvas & height state
  let mapWidth = $state(600);
  let mapHeight = $state(480);
  let isSizeLocked = $state(true);

  let resizingMapHeight = $state(false);
  let startMapH = 480;
  let startMapMouseY = 0;

  // Restore saved map dimensions and lock preference
  $effect(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(MAP_CONFIG_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.mapWidth) mapWidth = parsed.mapWidth;
          if (parsed.mapHeight) mapHeight = parsed.mapHeight;
          if (typeof parsed.isSizeLocked === "boolean")
            isSizeLocked = parsed.isSizeLocked;
        }
      } catch {
        /* Fallback */
      }
    }
  });

  function saveMapConfig() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(
        MAP_CONFIG_KEY,
        JSON.stringify({ mapWidth, mapHeight, isSizeLocked }),
      );
    } catch {
      /* Fallback */
    }
  }

  function toggleLockSize() {
    isSizeLocked = !isSizeLocked;
    saveMapConfig();
  }

  function setWidthPreset(w: number) {
    if (isSizeLocked) return;
    mapWidth = w;
    saveMapConfig();
  }

  function handleDragStart(e: MouseEvent, id: string) {
    if (!editMode) return;
    draggingId = id;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleStartConnect(e: MouseEvent, id: string) {
    if (!editMode) return;
    connectingFromId = id;
    updateMousePosition(e);
    window.addEventListener("mousemove", handleConnectMouseMove);
    window.addEventListener("mouseup", handleConnectMouseUp);
  }

  function handleResizeStart(e: MouseEvent, id: string) {
    if (!editMode) return;
    const dev = snapshot.devices.find((d) => d.id === id);
    if (!dev) return;
    resizingId = id;
    resizeStartPos = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: dev.width || 158,
      startH: dev.height || 100,
    };
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
  }

  function handleResizeMouseMove(e: MouseEvent) {
    if (!resizingId) return;
    const dx = e.clientX - resizeStartPos.mouseX;
    const dy = e.clientY - resizeStartPos.mouseY;

    const dev = snapshot.devices.find((d) => d.id === resizingId);
    if (dev) {
      const newWidth = Math.max(
        120,
        Math.min(320, Math.round(resizeStartPos.startW + dx)),
      );
      const newHeight = Math.max(
        40,
        Math.min(260, Math.round(resizeStartPos.startH + dy)),
      );
      dev.width = newWidth;
      dev.height = newHeight;
      onmove?.(resizingId, dev.x, dev.y, newWidth, newHeight);
    }
  }

  function handleResizeMouseUp() {
    resizingId = null;
    window.removeEventListener("mousemove", handleResizeMouseMove);
    window.removeEventListener("mouseup", handleResizeMouseUp);
  }

  function handleMapHeightResizeStart(e: MouseEvent) {
    if (isSizeLocked) return;
    resizingMapHeight = true;
    startMapH = mapHeight;
    startMapMouseY = e.clientY;
    window.addEventListener("mousemove", handleMapHeightMouseMove);
    window.addEventListener("mouseup", handleMapHeightMouseUp);
  }

  function handleMapHeightMouseMove(e: MouseEvent) {
    if (!resizingMapHeight) return;
    const dy = e.clientY - startMapMouseY;
    mapHeight = Math.max(320, Math.min(850, startMapH + dy));
  }

  function handleMapHeightMouseUp() {
    resizingMapHeight = false;
    window.removeEventListener("mousemove", handleMapHeightMouseMove);
    window.removeEventListener("mouseup", handleMapHeightMouseUp);
    saveMapConfig();
  }

  function updateMousePosition(e: MouseEvent) {
    if (!mapEl) return;
    const rect = mapEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mousePos = {
      x: Math.max(
        10,
        Math.min(
          mapWidth - 10,
          Math.round(((e.clientX - rect.left) / rect.width) * mapWidth),
        ),
      ),
      y: Math.max(
        10,
        Math.min(
          mapHeight - 10,
          Math.round(((e.clientY - rect.top) / rect.height) * mapHeight),
        ),
      ),
    };
  }

  function handleConnectMouseMove(e: MouseEvent) {
    updateMousePosition(e);
  }

  function handleConnectMouseUp(e: MouseEvent) {
    if (!connectingFromId || !mapEl) return;

    // Check if mouse released over a target node
    const rect = mapEl.getBoundingClientRect();
    const dropX = Math.round(((e.clientX - rect.left) / rect.width) * mapWidth);
    const dropY = Math.round(
      ((e.clientY - rect.top) / rect.height) * mapHeight,
    );

    // Target node bounding box matching (width 158 = +-80, height 100 = +-50)
    const targetDev = snapshot.devices.find(
      (d) =>
        d.id !== connectingFromId &&
        Math.abs(d.x - dropX) <= 80 &&
        Math.abs(d.y - dropY) <= 55,
    );

    if (targetDev && onconnectlink) {
      onconnectlink(connectingFromId, targetDev.id);
    }

    connectingFromId = null;
    window.removeEventListener("mousemove", handleConnectMouseMove);
    window.removeEventListener("mouseup", handleConnectMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!draggingId || !mapEl) return;
    const rect = mapEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = Math.max(
      40,
      Math.min(
        mapWidth - 40,
        Math.round(((e.clientX - rect.left) / rect.width) * mapWidth),
      ),
    );
    const y = Math.max(
      40,
      Math.min(
        mapHeight - 40,
        Math.round(((e.clientY - rect.top) / rect.height) * mapHeight),
      ),
    );

    const dev = snapshot.devices.find((d) => d.id === draggingId);
    if (dev) {
      dev.x = x;
      dev.y = y;
      onmove?.(draggingId, x, y, dev.width, dev.height);
    }
  }

  function handleMouseUp() {
    draggingId = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }

  function handleRemoveLink(linkId: string) {
    if (editMode && confirm("ต้องการลบเส้นเชื่อมต่อสาย Link นี้หรือไม่?")) {
      ondeletelink?.(linkId);
    }
  }
</script>

<!-- Map Dimension Lock & Horizontal Expand Bar -->
<div class="map-controls-bar">
  <div class="flex items-center gap-2">
    <!-- Lock / Unlock Map Size Button -->
    <button
      onclick={toggleLockSize}
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer {isSizeLocked
        ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
        : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'}"
      title={isSizeLocked
        ? "ขนาด Map ถูกล็อกไว้ (คลิกเพื่อปลดล็อกขยายขนาด)"
        : "ขนาด Map ปลดล็อกอยู่ (คลิกเพื่อล็อกขนาด)"}
    >
      {#if isSizeLocked}
        <Lock size={13} class="text-slate-600" />
        <span>Map Size Locked ({mapWidth}×{mapHeight}px)</span>
      {:else}
        <Unlock size={13} class="text-amber-700 animate-pulse" />
        <span>Map Resizable ({mapWidth}×{mapHeight}px)</span>
      {/if}
    </button>
  </div>

  <!-- Horizontal Canvas Width Selector (ขยายซ้าย-ขวา) -->
  <div class="flex items-center gap-1 text-xs">
    <span class="text-slate-500 font-medium flex items-center gap-1 mr-1">
      <MoveHorizontal size={13} />
      ความกว้าง:
    </span>
    <button
      onclick={() => setWidthPreset(600)}
      disabled={isSizeLocked}
      class="px-2 py-0.5 rounded text-[11px] font-medium border transition-colors disabled:opacity-50 {mapWidth ===
      600
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}"
    >
      ปกติ (600px)
    </button>
    <button
      onclick={() => setWidthPreset(900)}
      disabled={isSizeLocked}
      class="px-2 py-0.5 rounded text-[11px] font-medium border transition-colors disabled:opacity-50 {mapWidth ===
      900
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}"
    >
      กว้าง (900px)
    </button>
    <button
      onclick={() => setWidthPreset(1200)}
      disabled={isSizeLocked}
      class="px-2 py-0.5 rounded text-[11px] font-medium border transition-colors disabled:opacity-50 {mapWidth ===
      1200
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}"
    >
      กว้างมาก (1200px)
    </button>
  </div>
</div>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access is required to scroll the wide topology region.) -->
<div
  class="map-scroll"
  role="region"
  aria-label="Network topology diagram. Scroll horizontally on small screens."
  tabindex="0"
>
  <div class="map" bind:this={mapEl} style:height={`${mapHeight}px`}>
    <svg
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="topology-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="#dce3ec" />
        </pattern>
        <!-- Glow Filter for Traffic Particles -->
        <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={mapWidth} height={mapHeight} fill="url(#topology-grid)" />

      {#each snapshot.links as link, index (link.id)}
        {@const from = snapshot.devices.find((d) => d.id === link.source)}
        {@const to = snapshot.devices.find((d) => d.id === link.target)}
        {#if from && to}
          {@const isOffline =
            link.status === "offline" ||
            from.status === "offline" ||
            to.status === "offline"}
          {@const pathD =
            from.y === to.y
              ? `M${from.x} ${from.y} H${to.x}`
              : `M${from.x} ${from.y} V${(from.y + to.y) / 2} H${to.x} V${to.y}`}
          {@const strokeColor = isOffline ? "#dc2626" : "#9aafd0"}
          {@const particleColor = isOffline ? "#ef4444" : "#2563eb"}
          {@const duration = `${(1.8 + (index % 3) * 0.6).toFixed(1)}s`}

          <!-- Base Connection Path -->
          <path
            id={`path-${link.id}`}
            d={pathD}
            fill="none"
            stroke={strokeColor}
            stroke-width={isOffline ? "3.5" : editMode ? "4" : "2"}
            stroke-dasharray={isOffline ? "6 4" : undefined}
            class="transition-all duration-150 {editMode
              ? 'cursor-pointer hover:stroke-red-500'
              : ''}"
            onclick={() => editMode && handleRemoveLink(link.id)}
          />

          <!-- Animated Glowing Traffic Pulse Particle (Active only when online) -->
          {#if !isOffline}
            <circle r="4.5" fill={particleColor} filter="url(#particle-glow)">
              <animateMotion dur={duration} repeatCount="indefinite">
                <mpath href={`#path-${link.id}`} />
              </animateMotion>
            </circle>
          {/if}
        {/if}
      {/each}

      <!-- Live Dragging Rubber-band Cable Wire -->
      {#if connectingFromId}
        {@const sourceDev = snapshot.devices.find(
          (d) => d.id === connectingFromId,
        )}
        {#if sourceDev}
          <path
            d={`M ${sourceDev.x} ${sourceDev.y} L ${mousePos.x} ${mousePos.y}`}
            fill="none"
            stroke="#2563eb"
            stroke-width="3"
            stroke-dasharray="6 4"
            class="animate-pulse"
          />
          <circle cx={mousePos.x} cy={mousePos.y} r="6" fill="#2563eb" />
        {/if}
      {/if}
    </svg>

    {#each snapshot.devices as device (device.id)}
      <TopologyNode
        {device}
        selected={selected === device.id}
        {editMode}
        {mapWidth}
        {mapHeight}
        {onselect}
        ondragstart={handleDragStart}
        onstartconnect={handleStartConnect}
        onresizestart={handleResizeStart}
      />
    {/each}
  </div>

  <!-- Map Height Resize Bar -->
  <div
    class="map-resize-bar"
    class:locked={isSizeLocked}
    onmousedown={handleMapHeightResizeStart}
    onclick={() => isSizeLocked && toggleLockSize()}
    title={isSizeLocked
      ? "ขนาด Map ถูกล็อกไว้ (คลิกเพื่อปลดล็อก)"
      : "ลากขึ้น/ลง เพื่อปรับความสูงของแผนผังเครือข่าย"}
    role="slider"
    aria-valuenow={mapHeight}
    aria-valuemin={320}
    aria-valuemax={850}
    aria-label="Resize map view height"
    tabindex="0"
  >
    <div class="resize-pill"></div>
    <span class="resize-hint flex items-center gap-1">
      {#if isSizeLocked}
        <Lock size={10} class="text-slate-500" />
        <span>Locked {mapWidth}×{mapHeight}px</span>
      {:else}
        <Unlock size={10} class="text-amber-600" />
        <span>Drag {mapHeight}px</span>
      {/if}
    </span>
  </div>
</div>

<style>
  .map-controls-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }
  .map-scroll {
    overflow-x: auto;
    position: relative;
  }
  .map {
    height: 480px;
    min-width: 610px;
    position: relative;
    background: #fcfdff;
    transition: height 0.05s ease-out;
  }
  .map svg {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  .map-resize-bar {
    height: 22px;
    background: #f8fafc;
    border-top: 1px dashed #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ns-resize;
    position: relative;
    user-select: none;
    transition: background-color 0.15s;
  }
  .map-resize-bar.locked {
    cursor: pointer;
    background: #f1f5f9;
    border-top-style: solid;
  }
  .map-resize-bar:hover {
    background: #e2e8f0;
  }
  .resize-pill {
    width: 48px;
    height: 4px;
    background: #94a3b8;
    border-radius: 2px;
  }
  .resize-hint {
    position: absolute;
    right: 12px;
    font-size: 10px;
    color: #64748b;
    font-family: monospace;
  }
</style>
