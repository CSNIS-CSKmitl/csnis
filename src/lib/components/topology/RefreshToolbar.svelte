<script lang="ts">
  import {
    RefreshCw,
    Lock,
    Unlock,
    Plus,
    Save,
    RotateCcw,
  } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";

  let {
    autoRefresh,
    busy,
    editMode = false,
    hasUnsavedChanges = false,
    onToggle,
    onRefresh,
    onToggleAdmin,
    onOpenAddDevice,
    onSaveLayout,
    onResetLayout,
  }: {
    autoRefresh: boolean;
    busy: boolean;
    editMode?: boolean;
    hasUnsavedChanges?: boolean;
    onToggle: (checked: boolean) => void;
    onRefresh: () => void;
    onToggleAdmin?: () => void;
    onOpenAddDevice?: () => void;
    onSaveLayout?: () => void;
    onResetLayout?: () => void;
  } = $props();
</script>

<div
  class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
>
  <!-- Live System Badge & Lock / Unlock Status -->
  <div class="flex flex-wrap items-center gap-3">
    <div
      class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
    >
      <span class="relative flex h-2 w-2">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
        ></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
        ></span>
      </span>
      <span>Live System API (OPNsense / D-Link / Linux Bridge)</span>
    </div>

    <!-- Admin Edit Lock / Unlock Button -->
    <button
      onclick={() => onToggleAdmin?.()}
      class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer {editMode
        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'}"
      title={editMode
        ? "Click to Lock (Read-Only Mode)"
        : "Click to Unlock Admin Edit Mode (PIN required)"}
    >
      {#if editMode}
        <Unlock size={13} class="text-amber-600" />
        <span>Admin Edit Unlocked</span>
      {:else}
        <Lock size={13} class="text-slate-500" />
        <span>Read-Only Mode</span>
      {/if}
    </button>

    {#if hasUnsavedChanges}
      <span class="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full animate-pulse">
        ● มีรายการแก้ไขที่ยังไม่ได้บันทึก
      </span>
    {:else}
      <span class="text-xs text-slate-500">
        {autoRefresh ? "" : "Auto-refresh paused"}
      </span>
    {/if}
  </div>

  <!-- Primary Action Controls: Add Device, Save Topology, Reset, Auto Refresh -->
  <div
    class="flex flex-wrap items-center justify-between gap-2.5 sm:justify-end"
  >
    {#if editMode}
      {#if onOpenAddDevice}
        <Button
          variant="default"
          class="h-9 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
          onclick={onOpenAddDevice}
        >
          <Plus size={15} />
          Add Device (เพิ่มอุปกรณ์)
        </Button>
      {/if}

      {#if onSaveLayout}
        <Button
          variant="default"
          class="h-9 gap-1.5 text-xs font-medium shadow-xs transition-all cursor-pointer {hasUnsavedChanges
            ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse ring-2 ring-amber-400 font-bold'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'}"
          onclick={() => onSaveLayout?.()}
        >
          <Save size={14} />
          {hasUnsavedChanges ? "Save Topology (คลิกเพื่อบันทึก!)" : "Save Topology (บันทึกผัง)"}
        </Button>
      {/if}

      {#if onResetLayout}
        <Button
          variant="outline"
          class="h-9 gap-1.5 text-xs text-slate-600 border-slate-200 hover:bg-slate-100"
          onclick={() => onResetLayout?.()}
          title="Reset layout to default"
        >
          <RotateCcw size={13} />
          Reset
        </Button>
      {/if}
    {/if}

    <div class="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
      <Switch
        id="auto-refresh"
        checked={autoRefresh}
        onCheckedChange={onToggle}
      />
      <label
        class="text-xs text-slate-700 font-medium cursor-pointer"
        for="auto-refresh">Auto-refresh</label
      >
    </div>

    <Button
      variant="outline"
      class="h-9 text-xs"
      disabled={busy}
      onclick={onRefresh}
    >
      <RefreshCw size={14} class={busy ? "animate-spin" : ""} />
      {busy ? "Refreshing…" : "Refresh"}
    </Button>
  </div>
</div>
