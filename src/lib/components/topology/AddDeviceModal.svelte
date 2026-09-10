<script lang="ts">
  import { X, Plus, HardDrive } from 'lucide-svelte';
  import type { NetworkDevice, DeviceKind } from '$lib/monitoring/types';

  let {
    open = $bindable(false),
    onadd
  }: {
    open: boolean;
    onadd: (device: Omit<NetworkDevice, 'status' | 'latency' | 'utilization'> & { connectedTo?: string }) => void;
  } = $props();

  let name = $state('');
  let kind = $state<DeviceKind>('switch');
  let address = $state('');
  let location = $state('');
  let connectedTo = $state('dlink');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
    onadd({
      id,
      name: name.trim(),
      kind,
      address: address.trim(),
      location: location.trim() || 'Local Network',
      x: Math.floor(Math.random() * 250) + 150,
      y: Math.floor(Math.random() * 200) + 150,
      connectedTo
    });

    // Reset and close
    name = '';
    address = '';
    location = '';
    open = false;
  }

  function close() {
    open = false;
  }
</script>

{#if open}
  <div class="modal-backdrop" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()} role="button" tabindex="-1" aria-label="Close modal backdrop">
    <div class="modal-card" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="0">

      <div class="modal-header">
        <div class="flex items-center gap-2 font-semibold text-slate-800 text-base">
          <div class="rounded-full bg-blue-100 p-2 text-blue-700">
            <HardDrive size={20} />
          </div>
          <span>เพิ่มอุปกรณ์เครือข่ายใหม่</span>
        </div>
        <button class="close-btn" onclick={close} aria-label="Close dialog">
          <X size={18} />
        </button>
      </div>

      <form onsubmit={handleSubmit} class="modal-body">
        <div class="form-group">
          <label for="dev-name" class="label">ชื่ออุปกรณ์ (Device Name)</label>
          <input
            id="dev-name"
            type="text"
            bind:value={name}
            placeholder="เช่น Linux Bridge #2, Access Point, VLAN Switch"
            class="input-field"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label for="dev-kind" class="label">ประเภทอุปกรณ์ (Kind)</label>
            <select id="dev-kind" bind:value={kind} class="input-field">
              <option value="firewall">Firewall (e.g. OPNsense)</option>
              <option value="switch">Switch (e.g. D-Link)</option>
              <option value="core">Core / Bridge (e.g. Linux Bridge)</option>
              <option value="wireless">Wireless (Access Point)</option>
              <option value="router">Router / Gateway</option>
              <option value="server">Server / Host VM</option>
            </select>
          </div>

          <div>
            <label for="dev-address" class="label">IP Address / Host</label>
            <input
              id="dev-address"
              type="text"
              bind:value={address}
              placeholder="192.168.1.x"
              class="input-field"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="dev-location" class="label">ตำแหน่ง / รายละเอียด (Location)</label>
          <input
            id="dev-location"
            type="text"
            bind:value={location}
            placeholder="เช่น Rack 1, Office Floor 2"
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label for="dev-connect" class="label">เชื่อมต่อเข้ากับ Node (Link Source)</label>
          <select id="dev-connect" bind:value={connectedTo} class="input-field">
            <option value="opnsense">OPNsense Firewall</option>
            <option value="dlink">D-Link Smart Switch</option>
            <option value="linux-bridge">Linux Bridge</option>
            <option value="servers">Server Cluster</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick={close}>ยกเลิก</button>
          <button type="submit" class="btn-submit">
            <Plus size={16} />
            เพิ่มอุปกรณ์
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .modal-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 480px;
    overflow: hidden;
    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .close-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    margin-bottom: 4px;
  }

  .input-field {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
  }
  .input-field:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
  }

  .btn-cancel {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
  }

  .btn-submit {
    background: #2563eb;
    color: #ffffff;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
