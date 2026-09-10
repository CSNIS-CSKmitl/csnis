<script lang="ts">
  import type { DeviceStatus } from '$lib/monitoring/types';
  let { status }: {
      status: DeviceStatus;
  } = $props();
</script>

<span class="status" class:warning={status==='warning'} class:offline={status==='offline'}>
  <span class="dot"></span>
  {status==='online'?'Online':status==='warning'?'Warning':'Offline'}</span>

<style>
  .status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #15803d;
    background: #f0fdf4;
    border: 1px solid #dcfce7;
    padding: 3px 9px;
    border-radius: 6px;
    font-size: .75rem;
    font-weight: 500;
    white-space: nowrap;
  }
  .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
  }
  .warning {
    color: #a16207;
    background: #fffbeb;
    border-color: #fef3c7;
  }
  .offline {
    color: #b91c1c;
    background: #fef2f2;
    border-color: #fee2e2;
  }
</style>
