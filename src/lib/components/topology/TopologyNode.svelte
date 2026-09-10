<script lang="ts">
  import { Network, Router, ShieldCheck, Wifi, Server, Cable, Move } from 'lucide-svelte';
  import type { NetworkDevice } from '$lib/monitoring/types';

  let {
    device,
    selected,
    editMode = false,
    onselect,
    ondragstart
  }: {
    device: NetworkDevice;
    selected: boolean;
    editMode?: boolean;
    onselect: (id: string) => void;
    ondragstart?: (e: MouseEvent, id: string) => void;
  } = $props();

  const icons = { router: Router, firewall: ShieldCheck, core: Network, wireless: Wifi, server: Server, switch: Cable };
  let Icon = $derived(icons[device.kind]);

  function handleMouseDown(e: MouseEvent) {
    if (editMode && ondragstart) {
      ondragstart(e, device.id);
    }
  }
</script>

<button
  class="node"
  class:core={device.kind==='core'}
  class:selected
  class:editable={editMode}
  class:warning={device.status==='warning'}
  class:offline={device.status==='offline'}
  style:left={`${device.x/6}%`}
  style:top={`${device.y/4.8}%`}
  onclick={() => onselect(device.id)}
  onmousedown={handleMouseDown}
  aria-pressed={selected}
  aria-label={`${device.name}: ${device.status}. Show device details`}
>
  {#if editMode}
    <span class="drag-badge" title="Drag to reposition node">
      <Move size={12} />
    </span>
  {/if}

  <span class="node-icon">
    <Icon size={24}/>
    <i></i>
  </span>
  <strong>{device.name}</strong>
  <small>{device.status==='online'?'Online':device.status==='warning'?'Warning':'Offline'}</small>
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
  .warning {
    border-color: #eab308;
  }
  .warning small {
    color: #a16207;
  }
  .warning i {
    background: #d97706;
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

