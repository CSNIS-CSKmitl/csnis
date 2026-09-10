<script lang="ts">
  import { Network, Router, ShieldCheck, Wifi, Server, Cable, Move, Link, Scaling } from 'lucide-svelte';
  import type { NetworkDevice } from '$lib/monitoring/types';

  let {
    device,
    selected,
    editMode = false,
    mapWidth = 600,
    mapHeight = 480,
    onselect,
    ondragstart,
    onstartconnect,
    onresizestart
  }: {
    device: NetworkDevice;
    selected: boolean;
    editMode?: boolean;
    mapWidth?: number;
    mapHeight?: number;
    onselect: (id: string) => void;
    ondragstart?: (e: MouseEvent, id: string) => void;
    onstartconnect?: (e: MouseEvent, id: string) => void;
    onresizestart?: (e: MouseEvent, id: string) => void;
  } = $props();

  const icons = { router: Router, firewall: ShieldCheck, core: Network, wireless: Wifi, server: Server, switch: Cable };
  let Icon = $derived(icons[device.kind]);

  function handleMouseDown(e: MouseEvent) {
    if (editMode && ondragstart) {
      e.preventDefault();
      ondragstart(e, device.id);
    }
  }

  function handleConnectMouseDown(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (editMode && onstartconnect) {
      onstartconnect(e, device.id);
    }
  }

  function handleResizeMouseDown(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (editMode && onresizestart) {
      onresizestart(e, device.id);
    }
  }
</script>

<button
  class="node"
  class:core={device.kind==='core'}
  class:selected
  class:editable={editMode}
  class:offline={device.status==='offline'}
  style:left={`${(device.x / mapWidth) * 100}%`}
  style:top={`${(device.y / mapHeight) * 100}%`}
  style:width={`${device.width || 158}px`}
  style:min-height={`${device.height || 100}px`}
  onclick={() => onselect(device.id)}
  onmousedown={handleMouseDown}
  aria-pressed={selected}
  aria-label={`${device.name}: ${device.status}. Show device details`}
>
  {#if editMode}
    <span class="drag-badge" title="ลากเพื่อย้ายตำแหน่ง">
      <Move size={12} />
    </span>
    <!-- Cable Port Connector Handle -->
    <span
      class="connect-badge"
      onmousedown={handleConnectMouseDown}
      title="ลากเส้นจากจุดนี้ไปหาอุปกรณ์อื่นเพื่อเชื่อมสาย Link"
      role="button"
      tabindex="-1"
    >
      <Link size={12} />
    </span>
    <!-- Resize Node Handle -->
    <span
      class="resize-badge"
      onmousedown={handleResizeMouseDown}
      title="ลากเพื่อปรับขนาดย่อ/ขยายกล่องอุปกรณ์"
      role="button"
      tabindex="-1"
    >
      <Scaling size={12} />
    </span>
  {/if}

  <span class="node-icon">
    <Icon size={24}/>
    <i></i>
  </span>
  <strong>{device.name}</strong>
  <small>{device.status==='online'?'Online':'Offline'}</small>
</button>

<style>
  .node {
    position: absolute;
    transform: translate(-50%,-50%);
    width: 158px;
    min-height: 100px;
    padding: 12px 8px;
    border: 1px solid #dbe4ee;
    border-radius: 12px;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    color: #334155;
    user-select: none;
    transition: box-shadow 0.15s;
  }
  .editable {
    cursor: grab;
  }
  .editable:active {
    cursor: grabbing;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  .drag-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    background: #f1f5f9;
    color: #64748b;
    padding: 3px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .resize-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: #f1f5f9;
    color: #64748b;
    padding: 3px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: se-resize;
    transition: background-color 0.15s, color 0.15s;
  }
  .resize-badge:hover {
    background: #2563eb;
    color: white;
  }
  .connect-badge {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #2563eb;
    color: white;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: crosshair;
    box-shadow: 0 2px 5px rgba(37, 99, 235, 0.4);
    transition: transform 0.15s, background-color 0.15s;
  }
  .connect-badge:hover {
    background: #1d4ed8;
    transform: translateX(-50%) scale(1.25);
  }
  .node strong {
    font-size: .75rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .node small {
    font-size: .7rem;
    color: #15803d;
  }
  .node-icon {
    position: relative;
    color: #1d4ed8;
  }
  .node-icon i {
    position: absolute;
    width: 7px;
    height: 7px;
    background: #16a34a;
    border-radius: 50%;
    right: -6px;
    top: 0;
  }
  .core {
    background: #1d4ed8;
    color: white;
    border-color: #1d4ed8;
  }
  .core .node-icon,.core small {
    color: white;
  }
  .selected {
    outline: 3px solid #93c5fd;
    outline-offset: 4px;
  }
  .offline {
    border-color: #ef4444;
  }
  .offline small {
    color: #b91c1c;
  }
  .offline i {
    background: #dc2626;
  }
</style>


