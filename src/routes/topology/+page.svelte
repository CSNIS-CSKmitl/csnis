<script lang="ts">
  import NetworkSummary from "$lib/components/topology/NetworkSummary.svelte";
  import ConnectionsTable from "$lib/components/topology/ConnectionsTable.svelte";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import {
    Network,
    Info,
    Lock,
    Unlock,
    Maximize2,
    Minimize2,
  } from "lucide-svelte";
  import RefreshToolbar from "$lib/components/topology/RefreshToolbar.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import TopologyMap from "$lib/components/topology/TopologyMap.svelte";
  import DeviceDetails from "$lib/components/topology/DeviceDetails.svelte";
  import RecentEvents from "$lib/components/topology/RecentEvents.svelte";
  import StatusBadge from "$lib/components/topology/StatusBadge.svelte";
  import AdminPinModal from "$lib/components/topology/AdminPinModal.svelte";
  import AddDeviceModal from "$lib/components/topology/AddDeviceModal.svelte";
  import { createMockProvider } from "$lib/monitoring/mock";
  import { createApiProvider } from "$lib/monitoring/api";
  import { createPoller } from "$lib/monitoring/poller";
  import {
    computeMonitoringStats,
    type DeviceFilter,
    type StatsTimeRange,
  } from "$lib/monitoring-stats";
  import type {
    NetworkSnapshot,
    NetworkDevice,
    NetworkLink,
  } from "$lib/monitoring/types";

  let snapshot = $state<NetworkSnapshot | null>(null);
  let selected = $state("opnsense");
  let autoRefresh = $state(true);
  let busy = $state(false);
  let error = $state("");
  let providerMode = $state<"mock" | "api">("api");
  let timeRange = $state<StatsTimeRange>("today");
  let activeFilter = $state<DeviceFilter>("all");
  let editMode = $state(false);
  let fullWidth = $state(false);
  let hasUnsavedChanges = $state(false);

  let pinModalOpen = $state(false);
  let addModalOpen = $state(false);
  let isSaving = $state(false);

  let poller: ReturnType<typeof createPoller> | undefined;
  let selectedDevice = $derived(
    snapshot?.devices.find((d) => d.id === selected),
  );
  let currentStats = $derived(
    snapshot
      ? snapshot.stats && snapshot.stats.range === timeRange
        ? snapshot.stats
        : computeMonitoringStats(snapshot, snapshot.samples ?? [], timeRange)
      : null,
  );
  let selectedDeviceStat = $derived(
    selected && currentStats ? currentStats.deviceStats[selected] : undefined,
  );
  let selectedDeviceIncidents = $derived(
    selected && currentStats
      ? currentStats.offlineHistory.filter((inc) => inc.deviceId === selected)
      : [],
  );

  function selectDevice(id: string) {
    selected = id;
  }

  const STORAGE_KEY = "csnis_custom_topology_v1";

  function saveToLocalStorage(data: NetworkSnapshot) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ devices: data.devices, links: data.links }),
      );
    } catch {
      /* LocalStorage permission fallback */
    }
  }

  function loadFromLocalStorage(): {
    devices: NetworkDevice[];
    links: NetworkLink[];
  } | null {
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* Fallback */
    }
    return null;
  }

  async function saveToServer(data: NetworkSnapshot) {
    if (!data) return;
    isSaving = true;
    try {
      await fetch("/api/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_topology",
          devices: data.devices,
          links: data.links,
        }),
      });
    } catch (err) {
      console.error("Error saving topology to server:", err);
    } finally {
      isSaving = false;
    }
  }

  async function handleSaveLayout() {
    if (!snapshot) return;
    await saveToServer(snapshot);
    hasUnsavedChanges = false;
    await poller?.refresh();
    alert("บันทึกแผนผังเครือข่ายลงบนเซิร์ฟเวอร์ (Server Storage) สำเร็จ!");
  }

  async function handleResetLayout() {
    if (
      confirm(
        "คุณต้องการรีเซ็ตแผนผังเครือข่ายกลับเป็นค่าเริ่มต้นบนเซิร์ฟเวอร์ใช่หรือไม่?",
      )
    ) {
      try {
        isSaving = true;
        await fetch("/api/monitoring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset_topology" }),
        });
        isSaving = false;
        hasUnsavedChanges = false;
        await poller?.refresh();
        alert("รีเซ็ตแผนผังบนเซิร์ฟเวอร์เรียบร้อยแล้ว!");
      } catch {
        isSaving = false;
        alert("เกิดข้อผิดพลาดในการรีเซ็ตผังบนเซิร์ฟเวอร์");
      }
    }
  }

  function handleExportTopology() {
    if (!snapshot) return;
    const exportData = {
      devices: snapshot.devices,
      links: snapshot.links,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `csnis-topology-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleImportTopology(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed.devices) || !Array.isArray(parsed.links)) {
          alert(
            'รูปแบบไฟล์ JSON ไม่ถูกต้อง: จำเป็นต้องมีโครงสร้าง "devices" และ "links"',
          );
          return;
        }
        if (
          confirm(
            `คุณต้องการนำเข้าไฟล์ผังเครือข่ายที่มี ${parsed.devices.length} อุปกรณ์ และ ${parsed.links.length} การเชื่อมต่อ ใช่หรือไม่?`,
          )
        ) {
          snapshot = {
            devices: parsed.devices,
            links: parsed.links,
            events: snapshot?.events || [],
            timestamp: new Date().toISOString(),
            source: "api",
          };
          hasUnsavedChanges = true;
          alert(
            'นำเข้าผังเครือข่ายสำเร็จ! กรุณากด "Save Topology" เพื่อบันทึกลงเซิร์ฟเวอร์',
          );
        }
      } catch {
        alert("ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบความถูกต้องของไฟล์");
      }
    };
    reader.readAsText(file);
  }

  function handleUpdateDevice(updated: NetworkDevice) {
    if (!snapshot) return;
    const idx = snapshot.devices.findIndex((d) => d.id === updated.id);
    if (idx !== -1) {
      snapshot.devices[idx] = { ...updated };
      snapshot = { ...snapshot };
      hasUnsavedChanges = true;
    }
  }

  function handleDeleteDevice(id: string) {
    if (!snapshot) return;
    const newDevices = snapshot.devices.filter((d) => d.id !== id);
    const newLinks = snapshot.links.filter(
      (l) => l.source !== id && l.target !== id,
    );
    snapshot = {
      ...snapshot,
      devices: newDevices,
      links: newLinks,
    };
    if (selected === id) {
      selected = newDevices[0]?.id || "";
    }
    hasUnsavedChanges = true;
  }

  function handleAddCustomDevice(
    newDev: Omit<NetworkDevice, "status" | "latency" | "utilization"> & {
      connectedTo?: string;
    },
  ) {
    if (!snapshot) return;

    const deviceToAdd: NetworkDevice = {
      ...newDev,
      status: "online",
      latency: 1,
      utilization: 20,
    };

    const newDevices = [...snapshot.devices, deviceToAdd];
    let newLinks = [...snapshot.links];

    if (newDev.connectedTo) {
      const newLink: NetworkLink = {
        id: `link-${Date.now()}`,
        source: newDev.connectedTo,
        target: newDev.id,
        capacity: "1 Gbps",
        status: "online",
      };
      newLinks.push(newLink);
    }

    snapshot = {
      ...snapshot,
      devices: newDevices,
      links: newLinks,
    };
    selectDevice(deviceToAdd.id);
    hasUnsavedChanges = true;
  }

  function handleMoveDevice(
    id: string,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ) {
    if (!snapshot) return;
    const dev = snapshot.devices.find((d) => d.id === id);
    if (dev) {
      dev.x = x;
      dev.y = y;
      if (width !== undefined) dev.width = width;
      if (height !== undefined) dev.height = height;
      hasUnsavedChanges = true;
    }
  }

  function handleConnectLink(sourceId: string, targetId: string) {
    if (!snapshot || sourceId === targetId) return;
    const exists = snapshot.links.some(
      (l) =>
        (l.source === sourceId && l.target === targetId) ||
        (l.source === targetId && l.target === sourceId),
    );
    if (exists) return;

    const newLink: NetworkLink = {
      id: `link-${Date.now()}`,
      source: sourceId,
      target: targetId,
      capacity: "1 Gbps",
      status: "online",
    };

    snapshot = {
      ...snapshot,
      links: [...snapshot.links, newLink],
    };
    hasUnsavedChanges = true;
  }

  function handleDeleteLink(linkId: string) {
    if (!snapshot) return;
    snapshot = {
      ...snapshot,
      links: snapshot.links.filter((l) => l.id !== linkId),
    };
    hasUnsavedChanges = true;
  }

  function initPoller(mode: "mock" | "api") {
    poller?.dispose();
    const provider =
      mode === "api"
        ? createApiProvider(() => `/api/monitoring?range=${timeRange}`)
        : createMockProvider(() => timeRange);
    poller = createPoller(provider, {
      snapshot: (data) => {
        if (isSaving || editMode || hasUnsavedChanges) return;
        snapshot = data;
        error = "";
      },
      error: (message) => {
        if (!isSaving && !editMode && !hasUnsavedChanges) error = message;
      },
      busy: (value) => (busy = value),
    });
    if (!editMode) {
      void poller.refresh();
    }
  }

  function handleRangeChange(nextRange: StatsTimeRange) {
    timeRange = nextRange;
    void poller?.refresh();
  }

  function handleProviderChange(newMode: "mock" | "api") {
    providerMode = newMode;
    initPoller(newMode);
  }

  async function toggleAdmin() {
    if (editMode) {
      if (hasUnsavedChanges) {
        if (
          confirm(
            "คุณมีรายการแก้ไขแผนผังที่ยังไม่ได้บันทึก ต้องการบันทึกข้อมูลก่อนออกจาก Admin Mode ใช่หรือไม่?",
          )
        ) {
          await handleSaveLayout();
        }
      }
      editMode = false;
      hasUnsavedChanges = false;
      poller?.setPaused(!autoRefresh);
      void poller?.refresh();
    } else {
      pinModalOpen = true;
    }
  }

  onMount(() => {
    selected = page.url.searchParams.get("device") || "opnsense";
    initPoller(providerMode);

    const lifecycle = new AbortController();
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;

    if (context?.registerTool) {
      try {
        void Promise.resolve(
          context.registerTool(
            {
              name: "select_network_device",
              title: "Inspect network device",
              description:
                "Select a CSNIS device and show its current details in the topology view.",
              inputSchema: {
                type: "object",
                properties: { deviceId: { type: "string" } },
                required: ["deviceId"],
                additionalProperties: false,
              },
              annotations: { readOnlyHint: false, untrustedContentHint: false },
              execute(input: unknown) {
                const id = (input as { deviceId?: unknown })?.deviceId;
                if (
                  typeof id !== "string" ||
                  !snapshot?.devices.some((d) => d.id === id)
                )
                  throw new Error("Unknown network device.");
                selectDevice(id);
                return snapshot.devices.find((d) => d.id === id);
              },
            },
            { signal: lifecycle.signal },
          ),
        ).catch(() => {});
      } catch {
        /* Optional browser capability. */
      }
    }

    return () => {
      poller?.dispose();
      lifecycle.abort();
    };
  });
</script>

<svelte:head>
  <title>Live Topology — CSNIS</title>
  <meta
    name="description"
    content="แผนผังเครือข่าย CSNIS พร้อมข้อมูล OPNsense, D-Link Smart Switch, Linux Bridge และสถานะอุปกรณ์ Real-time"
  />
</svelte:head>

<div class="container">
  <PageHeader
    label="Network visibility"
    title="Live Topology"
    description="มองเห็นทุกการเชื่อมต่อ ติดตามสถานะ OPNsense, D-Link Switch, Linux Bridge และตรวจสอบอุปกรณ์ในเครือข่าย"
  />

  <RefreshToolbar
    {autoRefresh}
    {busy}
    {editMode}
    {hasUnsavedChanges}
    onToggle={(checked) => {
      autoRefresh = checked;
      poller?.setPaused(!checked);
    }}
    onRefresh={() => {
      void poller?.refresh();
    }}
    onToggleAdmin={toggleAdmin}
    onOpenAddDevice={() => (addModalOpen = true)}
    onSaveLayout={handleSaveLayout}
    onResetLayout={handleResetLayout}
    onExportTopology={handleExportTopology}
    onImportTopology={handleImportTopology}
  />

  {#if error}
    <div
      role="alert"
      class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <div>
        <strong>โหลดข้อมูลไม่ได้ (Unable to refresh):</strong>
        {snapshot ? "กำลังแสดงข้อมูลล่าสุดที่โหลดสำเร็จ · " : ""}
        {error}
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={() => void poller?.refresh()}
          class="rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
        >
          ลองใหม่ (Refresh)
        </button>
        {#if providerMode === "api"}
          <button
            type="button"
            onclick={() => handleProviderChange("mock")}
            class="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
          >
            สลับโหมดจำลอง (Demo Snapshot)
          </button>
        {/if}
      </div>
    </div>
  {/if}

  {#if snapshot}
    <NetworkSummary
      {snapshot}
      {timeRange}
      {activeFilter}
      {busy}
      {autoRefresh}
      onRangeChange={handleRangeChange}
      onFilterChange={(filter) => (activeFilter = filter)}
      onSelectDevice={selectDevice}
      onRefresh={() => void poller?.refresh()}
    />

    <div class="topology-layout" class:full-width={fullWidth}>
      <section class="panel overflow-hidden">
        <div class="map-heading">
          <div>
            <h2 class="text-base flex items-center gap-2">
              <Network size={18} class="text-blue-700" />
              Network map
            </h2>
            <p class="mt-1 text-xs muted">
              {#if editMode}
                <span class="text-amber-700 font-medium"
                  >Unlocked: Click and drag nodes to reposition layout.</span
                >
              {:else}
                Read-only mode: Select a device to inspect details.
              {/if}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Full Width Toggle Button (ขยายเต็มหน้าจอซ้าย-ขวา) -->
            <button
              onclick={() => (fullWidth = !fullWidth)}
              class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all cursor-pointer shadow-xs"
              title={fullWidth
                ? "ย่อพื้นที่กลับเป็นขนาดมาตรฐาน"
                : "ขยายพื้นที่แผนผังเต็มความกว้างซ้าย-ขวา (Full Width)"}
            >
              {#if fullWidth}
                <Minimize2 size={13} class="text-blue-600" />
                <span>ย่อกลับ (Normal)</span>
              {:else}
                <Maximize2 size={13} class="text-blue-600" />
                <span>ขยายซ้าย-ขวา (Full Width)</span>
              {/if}
            </button>

            {#if editMode}
              <span
                class="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-medium"
              >
                <Unlock size={12} class="text-amber-700" />
                Admin Edit Mode
              </span>
            {/if}
          </div>
        </div>

        {#if snapshot.devices.length}
          <TopologyMap
            {snapshot}
            {selected}
            {editMode}
            onselect={selectDevice}
            onmove={handleMoveDevice}
            onconnectlink={handleConnectLink}
            ondeletelink={handleDeleteLink}
          />
        {:else}
          <p class="p-12 text-center muted">
            No devices are available from the monitoring source.
          </p>
        {/if}
      </section>

      <aside class="space-y-5">
        <DeviceDetails
          device={selectedDevice}
          deviceStat={selectedDeviceStat}
          deviceIncidents={selectedDeviceIncidents}
          {editMode}
          onupdate={handleUpdateDevice}
          ondelete={handleDeleteDevice}
        />
        <RecentEvents
          events={snapshot.events}
          offlineHistory={currentStats?.offlineHistory ?? []}
        />
      </aside>
    </div>

    <ConnectionsTable
      {snapshot}
      {activeFilter}
      {timeRange}
      onSelectDevice={selectDevice}
    />
  {:else}
    <div class="panel p-16 text-center muted" role="status">
      {#if error}
        <p class="font-semibold text-red-700">
          โหลดข้อมูลไม่ได้ — Network data is unavailable.
        </p>
        <p class="mt-2 text-xs text-slate-600">
          กรุณาตรวจสอบสิทธิ์การเข้าถึงหรือกดปุ่ม Refresh เพื่อลองใหม่อีกครั้ง
        </p>
      {:else}
        <p class="font-medium text-slate-700">
          กำลังโหลดสถิติและแผนผังเครือข่าย… (Loading network topology…)
        </p>
      {/if}
    </div>
  {/if}
</div>

<!-- Security Modals -->
<AdminPinModal
  bind:open={pinModalOpen}
  onsuccess={() => {
    editMode = true;
    poller?.setPaused(true);
  }}
/>
<AddDeviceModal bind:open={addModalOpen} onadd={handleAddCustomDevice} />

<style>
  .topology-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 330px;
    gap: 22px;
    transition: all 0.2s ease-in-out;
  }
  .topology-layout.full-width {
    grid-template-columns: minmax(0, 1fr);
  }
  .topology-layout.full-width aside {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .topology-layout.full-width aside > :global(*) {
    margin-top: 0 !important;
  }
  .map-heading,
  .map-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
  }
  .map-heading {
    border-bottom: 1px solid #e2e8f0;
  }
  .map-footer {
    border-top: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }
  @media (max-width: 1000px) {
    .topology-layout {
      grid-template-columns: minmax(0, 1fr);
    }
    aside {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    aside > :global(*) {
      margin-top: 0 !important;
    }
  }
  @media (max-width: 650px) {
    aside {
      grid-template-columns: 1fr;
    }
    .map-heading {
      padding-inline: 18px;
    }
  }
</style>
