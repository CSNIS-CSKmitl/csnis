<script lang="ts">
  import type { NetworkDevice, DeviceKind } from "$lib/monitoring/types";
  import StatusBadge from "./StatusBadge.svelte";
  import {
    Activity,
    CheckCircle2,
    XCircle,
    Edit2,
    Check,
    Trash2,
    X,
    Info,
  } from "lucide-svelte";

  let {
    device,
    editMode = false,
    onupdate,
    ondelete,
  }: {
    device: NetworkDevice | undefined;
    editMode?: boolean;
    onupdate?: (updated: NetworkDevice) => void;
    ondelete?: (id: string) => void;
  } = $props();

  let pinging = $state(false);
  let pingResult = $state<{
    latency?: number;
    status?: string;
    error?: string;
  } | null>(null);
  let editing = $state(false);

  let editName = $state("");
  let editIp = $state("");
  let editLocation = $state("");
  let editKind = $state<DeviceKind>("switch");
  let editWidth = $state(158);
  let editHeight = $state(100);

  function startEditing() {
    if (!device) return;
    editName = device.name;
    editIp = device.address;
    editLocation = device.location;
    editKind = device.kind;
    editWidth = device.width || 158;
    editHeight = device.height || 100;
    editing = true;
  }

  function saveChanges() {
    if (!device || !onupdate) return;
    device.name = editName.trim();
    device.address = editIp.trim() || "Unnumbered (L2 Bridge)";
    device.location = editLocation.trim();
    device.kind = editKind;
    device.width = editWidth;
    device.height = editHeight;
    onupdate(device);
    editing = false;
  }

  function handleDelete() {
    if (!device || !ondelete) return;
    if (
      confirm(
        `คุณต้องการลบอุปกรณ์ "${device.name}" ออกจากแผนผังเครือข่ายใช่หรือไม่?`,
      )
    ) {
      ondelete(device.id);
      editing = false;
    }
  }

  async function runPingTest() {
    if (!device) return;
    pinging = true;
    pingResult = null;
    try {
      const res = await fetch("/api/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping", targetIp: device.address }),
      });
      const data = await res.json();
      if (data.status === "online") {
        pingResult = { latency: data.latency, status: "online" };
      } else {
        pingResult = {
          error: "Request timed out / Target Unreachable (offline)",
        };
      }
    } catch {
      pingResult = { error: "Network error performing live probe." };
    } finally {
      pinging = false;
    }
  }
</script>

<section class="panel p-6" aria-label="Device details">
  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
      Device Diagnostics
    </h3>
    {#if device && editMode}
      {#if editing}
        <button
          onclick={() => (editing = false)}
          class="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium"
        >
          <X size={14} />
          Close
        </button>
      {:else}
        <button
          onclick={startEditing}
          class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded"
        >
          <Edit2 size={13} />
          Edit Device
        </button>
      {/if}
    {/if}
  </div>

  {#if device}
    {@const isUnnumberedL2 =
      !device.address ||
      device.address === "N/A" ||
      device.address.toLowerCase().includes("l2") ||
      device.address.toLowerCase().includes("bridge") ||
      device.address.toLowerCase().includes("unnumbered")}
    {#if editing && editMode}
      <!-- Full Device Edit Form -->
      <form
        onsubmit={(e) => {
          e.preventDefault();
          saveChanges();
        }}
        class="space-y-3 mt-2"
      >
        <div>
          <label
            for="edit-dev-name"
            class="text-[11px] font-medium text-slate-600 block mb-0.5"
            >Device Name</label
          >
          <input
            id="edit-dev-name"
            type="text"
            bind:value={editName}
            class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            for="edit-dev-ip"
            class="text-[11px] font-medium text-slate-600 block mb-0.5"
            >IP Address / Host (Optional for L2 Bridges)</label
          >
          <input
            id="edit-dev-ip"
            type="text"
            bind:value={editIp}
            placeholder="e.g. 192.168.1.1 or leave blank for L2 Bridge"
            class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            for="edit-dev-loc"
            class="text-[11px] font-medium text-slate-600 block mb-0.5"
            >Location / Notes</label
          >
          <input
            id="edit-dev-loc"
            type="text"
            bind:value={editLocation}
            class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            for="edit-dev-kind"
            class="text-[11px] font-medium text-slate-600 block mb-0.5"
            >Device Type (Kind)</label
          >
          <select
            id="edit-dev-kind"
            bind:value={editKind}
            class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
          >
            <option value="firewall">Firewall (e.g. OPNsense)</option>
            <option value="switch">Switch (e.g. D-Link)</option>
            <option value="core">Core / Bridge (e.g. vmbr0/vmbr1)</option>
            <option value="wireless">Wireless (Access Point)</option>
            <option value="router">Router / Gateway</option>
            <option value="server">Server / VM Host</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label
              for="edit-dev-w"
              class="text-[11px] font-medium text-slate-600 block mb-0.5"
              >Width (px)</label
            >
            <input
              id="edit-dev-w"
              type="number"
              min="120"
              max="320"
              bind:value={editWidth}
              class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label
              for="edit-dev-h"
              class="text-[11px] font-medium text-slate-600 block mb-0.5"
              >Height (px)</label
            >
            <input
              id="edit-dev-h"
              type="number"
              min="40"
              max="260"
              bind:value={editHeight}
              class="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-between pt-2">
          <button
            type="button"
            onclick={handleDelete}
            class="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
          >
            <Trash2 size={13} />
            Delete
          </button>
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={() => (editing = false)}
              class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
            >
              <Check size={13} />
              Save
            </button>
          </div>
        </div>
      </form>
    {:else}
      <!-- Read-Only / Normal View -->
      <div class="flex items-start justify-between gap-2 pt-3">
        <h3 class="font-semibold text-base text-slate-800">
          {device.name}
        </h3>
        <StatusBadge status={device.status} />
      </div>
      <p class="mt-1 text-xs muted">{device.location}</p>

      <dl class="mt-5 space-y-3 text-xs">
        <div class="flex items-center justify-between gap-4">
          <dt class="muted">
            {isUnnumberedL2 ? "Layer 2 Interface" : "Management IP"}
          </dt>
          <dd class="font-mono font-medium text-slate-800">
            {#if isUnnumberedL2}
              <span
                class="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px]"
                >Unnumbered L2 Bridge</span
              >
            {:else}
              {device.address}
            {/if}
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="muted">Response time</dt>
          <dd class="font-medium text-slate-800">{device.latency} ms</dd>
        </div>
        <div class="flex justify-between">
          <dt class="muted">Utilization</dt>
          <dd class="font-medium text-slate-800">{device.utilization}%</dd>
        </div>
      </dl>

      <meter
        class="mt-3 w-full h-2 rounded overflow-hidden"
        min="0"
        max="100"
        low="60"
        high="80"
        optimum="30"
        value={device.utilization}
        aria-label={`${device.name} utilization`}>{device.utilization}%</meter
      >

      <!-- Diagnostic Section -->
      <div class="mt-5 pt-4 border-t border-slate-100">
        {#if isUnnumberedL2}
          <div
            class="rounded-lg bg-blue-50/80 p-2.5 text-xs text-blue-900 border border-blue-200/80 flex items-center gap-2"
          >
            <Info size={15} class="shrink-0 text-blue-600" />
            <span
              >Linux Virtual Bridge: Frame Forwarding Active (No IP required)</span
            >
          </div>
        {:else}
          <button
            onclick={runPingTest}
            disabled={pinging}
            class="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-60"
          >
            <Activity
              size={14}
              class={pinging ? "animate-pulse text-blue-600" : "text-slate-600"}
            />
            {pinging ? "Pinging target…" : "Run Live Ping Test"}
          </button>

          {#if pingResult}
            <div
              class="mt-3 rounded-md p-2.5 text-xs flex items-center gap-2 {pingResult.error
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}"
            >
              {#if pingResult.error}
                <XCircle size={15} class="shrink-0 text-red-600" />
                <span>{pingResult.error}</span>
              {:else}
                <CheckCircle2 size={15} class="shrink-0 text-emerald-600" />
                <span
                  >Probe Success: {pingResult.latency}ms ({pingResult.status})</span
                >
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  {:else}
    <p class="muted text-xs">
      Select a device to view details and diagnostics.
    </p>
  {/if}
</section>
