<script lang="ts">
  import { RefreshCw, Lock, Unlock, Plus, Activity, Cpu } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';

  let {
    autoRefresh,
    busy,
    providerMode = 'mock',
    editMode = false,
    onToggle,
    onRefresh,
    onProviderChange,
    onToggleAdmin,
    onOpenAddDevice
  }: {
    autoRefresh: boolean;
    busy: boolean;
    providerMode?: 'mock' | 'api';
    editMode?: boolean;
    onToggle: (checked: boolean) => void;
    onRefresh: () => void;
    onProviderChange?: (mode: 'mock' | 'api') => void;
    onToggleAdmin?: () => void;
    onOpenAddDevice?: () => void;
  } = $props();
</script>

<div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

  <div class="flex flex-wrap items-center gap-3">
    <!-- Provider Source Selector -->
    <div class="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors {providerMode === 'mock' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
        onclick={() => onProviderChange?.('mock')}
      >
        <Cpu size={14} />
        Demo Mock Mode
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors {providerMode === 'api' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}"
        onclick={() => onProviderChange?.('api')}
      >
        <Activity size={14} />
        Live API (Real System)
      </button>
    </div>

    <!-- Admin Status Badge -->
    <button
      onclick={() => onToggleAdmin?.()}
      class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all {editMode ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'}"
      title={editMode ? 'Edit Mode Unlocked (Click to Lock)' : 'Read-Only Mode (Click to Unlock with PIN)'}
    >
      {#if editMode}
        <Unlock size={13} class="text-amber-600" />
        <span>Admin Edit Mode</span>
      {:else}
        <Lock size={13} class="text-slate-500" />
        <span>Read-Only</span>
      {/if}
    </button>

    <span class="text-xs text-slate-500">
      {autoRefresh ? 'Refreshes every 5s' : 'Auto-refresh paused'}
    </span>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
    {#if editMode && onOpenAddDevice}
      <Button variant="default" class="h-9 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700" onclick={onOpenAddDevice}>
        <Plus size={14} />
        Add Device
      </Button>
    {/if}

    <div class="flex items-center gap-2">
      <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={onToggle} />
      <label class="text-xs text-slate-700 font-medium" for="auto-refresh">Auto-refresh</label>
    </div>

    <Button variant="outline" class="h-9 text-xs" disabled={busy} onclick={onRefresh}>
      <RefreshCw size={14} class={busy ? 'animate-spin' : ''} />
      {busy ? 'Refreshing…' : 'Refresh now'}
    </Button>
  </div>
</div>

