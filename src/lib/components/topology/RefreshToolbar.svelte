<script lang="ts">
  import { RefreshCw } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  let { autoRefresh, busy, onToggle, onRefresh }: {
      autoRefresh: boolean;
      busy: boolean;
      onToggle: (checked: boolean) => void;
      onRefresh: () => void;
  } = $props();
</script>

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

  <div class="flex flex-wrap items-center gap-3">

    <span class="rounded border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
      DEMO DATA
    </span>

    <span class="text-sm muted">
      {autoRefresh ? 'Refreshes every 5 seconds' : 'Auto-refresh paused'}
    </span>
  </div>

  <div class="flex items-center justify-between gap-5">

    <div class="flex items-center gap-2">

      <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={onToggle} />

      <label class="text-sm" for="auto-refresh">Auto-refresh</label>
    </div>

    <Button variant="outline" class="h-10" disabled={busy} onclick={onRefresh}>

      <RefreshCw size={15} class={busy ? 'animate-spin' : ''} />

      {busy ? 'Refreshing…' : 'Refresh now'}
    </Button>
  </div>
</div>
