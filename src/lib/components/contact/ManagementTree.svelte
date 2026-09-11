<script lang="ts">
  import { onMount } from "svelte";
  import {
    Network,
    Server,
    Layers,
    ShieldCheck,
    Users,
    Mail,
    MapPin,
    Search,
    ChevronDown,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    X,
    CheckCircle2,
    Briefcase,
    Sparkles,
    ExternalLink,
    Filter,
    LayoutGrid,
    GitFork,
    Lock,
    Unlock,
    KeyRound,
    AlertCircle,
    Save,
    Upload,
    Download,
    Plus,
    Edit3,
    Trash2,
    Award,
    Calendar,
    Undo2,
  } from "lucide-svelte";
  import {
    initialOrgChart,
    initialRetiredMembers,
    defaultOrgChartData,
    type OrgNode,
    type OrgChartData,
    updateNodeInTree,
    deleteNodeFromTree,
    addNodeToTree,
    flattenAllNodes,
    findParentNode,
  } from "$lib/data/orgChart";
  import OrgNodeEditModal from "./OrgNodeEditModal.svelte";

  const STORAGE_KEY = "csnis_custom_org_chart_v1";

  // Data State
  let chart = $state<OrgNode>(initialOrgChart);
  let retiredMembers = $state<OrgNode[]>(initialRetiredMembers);
  let hasUnsavedChanges = $state(false);
  let isSaving = $state(false);

  // Active view: 'tree' | 'grid' | 'retired'
  let viewMode = $state<"tree" | "grid" | "retired">("tree");
  let searchQuery = $state("");
  let selectedCategory = $state<string>("all");
  let selectedNode = $state<OrgNode | null>(null);

  // Zoom scale for tree view
  let zoomScale = $state(1);

  // Collapsed state tracking by node ID
  let collapsedNodes = $state<Record<string, boolean>>({});

  // Admin Edit Mode State (authenticated via same topology PIN)
  let isEditMode = $state(false);
  let showPinModal = $state(false);
  let pin = $state("");
  let pinError = $state("");
  let pinLoading = $state(false);

  // Node Edit / Add Modal State
  let showEditModal = $state(false);
  let nodeToEdit = $state<OrgNode | null>(null);
  let isAddingRetiredMember = $state(false);

  // Available parents for assigning tree children
  let allActiveNodes = $derived(flattenAllNodes(chart));
  let availableParents = $derived(
    allActiveNodes.map((n) => ({ id: n.id, name: n.name, role: n.role })),
  );

  // Load org chart on mount: from server first, with localStorage fallback
  onMount(async () => {
    try {
      const res = await fetch("/api/org-chart");
      if (res.ok) {
        const data: OrgChartData = await res.json();
        if (data && data.chart && Array.isArray(data.retiredMembers)) {
          chart = data.chart;
          retiredMembers = data.retiredMembers;
          saveToLocalStorage({
            chart: data.chart,
            retiredMembers: data.retiredMembers,
          });
          return;
        }
      }
    } catch {
      /* Fallback to localStorage */
    }

    // Try localStorage if server fetch failed or offline
    const local = loadFromLocalStorage();
    if (local) {
      chart = local.chart;
      retiredMembers = local.retiredMembers;
    }
  });

  function saveToLocalStorage(data: {
    chart: OrgNode;
    retiredMembers: OrgNode[];
  }) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }

  function loadFromLocalStorage(): {
    chart: OrgNode;
    retiredMembers: OrgNode[];
  } | null {
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return null;
  }

  // ==========================================
  // SERVER SYNC & PERSISTENCE
  // ==========================================
  async function handleSaveServer() {
    isSaving = true;
    try {
      const res = await fetch("/api/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_org_chart",
          chart,
          retiredMembers,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        hasUnsavedChanges = false;
        saveToLocalStorage({ chart, retiredMembers });
        alert(
          "บันทึกผังโครงสร้างการบริหารลงบนเซิร์ฟเวอร์ (Server JSON) เรียบร้อยแล้ว!",
        );
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้: " + (err as Error).message);
    } finally {
      isSaving = false;
    }
  }

  async function handleResetServer() {
    if (
      confirm(
        "คุณต้องการรีเซ็ตผังการบริหารและสมาชิกเกษียณอายุกลับเป็นค่าเริ่มต้นบนเซิร์ฟเวอร์ใช่หรือไม่?",
      )
    ) {
      isSaving = true;
      try {
        const res = await fetch("/api/org-chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset_org_chart" }),
        });

        const result = await res.json();
        if (res.ok && result.success && result.data) {
          chart = result.data.chart;
          retiredMembers = result.data.retiredMembers;
          hasUnsavedChanges = false;
          saveToLocalStorage({ chart, retiredMembers });
          alert("รีเซ็ตผังการบริหารเป็นค่าเริ่มต้นบนเซิร์ฟเวอร์สำเร็จ!");
        } else {
          alert("เกิดข้อผิดพลาดในการรีเซ็ตผัง");
        }
      } catch {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อรีเซ็ตได้");
      } finally {
        isSaving = false;
      }
    }
  }

  function handleExportJson() {
    const exportData = {
      chart,
      retiredMembers,
      exportedAt: new Date().toISOString(),
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `csnis-management-chart-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleImportJson(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.chart || !Array.isArray(parsed.retiredMembers)) {
          alert(
            'รูปแบบไฟล์ JSON ไม่ถูกต้อง: จำเป็นต้องมีโครงสร้าง "chart" และ "retiredMembers"',
          );
          return;
        }

        if (
          confirm(
            `คุณต้องการนำเข้าไฟล์ผังการบริหาร (${parsed.retiredMembers.length} สมาชิกเกษียณ) ใช่หรือไม่?`,
          )
        ) {
          chart = parsed.chart;
          retiredMembers = parsed.retiredMembers;
          hasUnsavedChanges = true;
          saveToLocalStorage({ chart, retiredMembers });
          alert(
            'นำเข้าข้อมูลสำเร็จ! กรุณากดปุ่ม "บันทึกลงเซิร์ฟเวอร์" เพื่อบันทึกลงไฟล์ server JSON',
          );
        }
      } catch (err) {
        alert("ไฟล์ JSON เสียหายหรือไม่ถูกต้อง: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  }

  // ==========================================
  // AUTHENTICATION (Exact same PIN as Topology)
  // ==========================================
  async function handleAuthenticate(e: SubmitEvent) {
    e.preventDefault();
    if (!pin.trim()) {
      pinError = "กรุณากรอก Admin PIN";
      return;
    }

    pinLoading = true;
    pinError = "";

    try {
      const res = await fetch("/api/monitoring/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        isEditMode = true;
        showPinModal = false;
        pin = "";
      } else {
        pinError =
          data.message || "Admin PIN ไม่ถูกต้อง (รหัสเริ่มต้นคือ 1234)";
      }
    } catch {
      pinError = "ไม่สามารถเชื่อมต่อเพื่อตรวจสอบ PIN ได้";
    } finally {
      pinLoading = false;
    }
  }

  // ==========================================
  // NODE MUTATIONS (Add / Edit / Delete)
  // ==========================================
  function openAddModal(isRetired = false, parentId?: string) {
    nodeToEdit = null;
    isAddingRetiredMember = isRetired;
    showEditModal = true;
  }

  function openEditModal(node: OrgNode) {
    nodeToEdit = node;
    isAddingRetiredMember = Boolean(node.isRetired);
    showEditModal = true;
  }

  async function handleDeleteNode(targetId: string, isRetired = false) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่ง/สมาชิกนี้?")) {
      if (isRetired) {
        retiredMembers = retiredMembers.filter((m) => m.id !== targetId);
      } else {
        if (chart.id === targetId) {
          alert("ไม่สามารถลบตำแหน่งสูงสุดของผังบริหารได้");
          return;
        }
        chart = deleteNodeFromTree(chart, targetId);
      }
      saveToLocalStorage({ chart, retiredMembers });

      // Auto-persist to server
      try {
        const res = await fetch("/api/org-chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_org_chart",
            chart,
            retiredMembers,
          }),
        });
        if (res.ok) {
          hasUnsavedChanges = false;
        } else {
          hasUnsavedChanges = true;
        }
      } catch {
        hasUnsavedChanges = true;
      }
    }
  }

  async function handleSaveNode(updated: OrgNode, parentId?: string) {
    if (updated.isRetired) {
      const existingIdx = retiredMembers.findIndex((m) => m.id === updated.id);
      if (existingIdx >= 0) {
        retiredMembers[existingIdx] = updated;
        retiredMembers = [...retiredMembers];
      } else {
        retiredMembers = [...retiredMembers, updated];
      }
    } else {
      // Active Node
      const isExisting = allActiveNodes.some((n) => n.id === updated.id);
      if (isExisting) {
        chart = updateNodeInTree(chart, updated);
      } else {
        // Adding new active node
        const targetParent = parentId || chart.id;
        chart = addNodeToTree(chart, targetParent, updated);
      }
    }
    saveToLocalStorage({ chart, retiredMembers });

    // Auto-persist directly to server JSON
    try {
      const res = await fetch("/api/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_org_chart",
          chart,
          retiredMembers,
        }),
      });
      if (res.ok) {
        hasUnsavedChanges = false;
      } else {
        hasUnsavedChanges = true;
      }
    } catch {
      hasUnsavedChanges = true;
    }
  }

  function toggleCollapse(id: string, e: MouseEvent) {
    e.stopPropagation();
    collapsedNodes[id] = !collapsedNodes[id];
  }

  function handleZoomIn() {
    zoomScale = Math.min(zoomScale + 0.15, 1.6);
  }

  function handleZoomOut() {
    zoomScale = Math.max(zoomScale - 0.15, 0.65);
  }

  function handleZoomReset() {
    zoomScale = 1;
  }

  function selectNode(node: OrgNode) {
    selectedNode = node;
  }

  function closeModal() {
    selectedNode = null;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeModal();
      showPinModal = false;
      showEditModal = false;
    }
  }

  // Helper for department styling (Monochrome Slate Theme)
  const categoryConfig: Record<
    string,
    {
      icon: any;
      border: string;
      bg: string;
      badgeBg: string;
      badgeText: string;
      accentBg: string;
      accentText: string;
    }
  > = {
    executive: {
      icon: ShieldCheck,
      border: "border-slate-300 hover:border-slate-500",
      bg: "bg-white",
      badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
      badgeText: "text-slate-800",
      accentBg: "bg-slate-900 text-white",
      accentText: "text-slate-700",
    },
    network: {
      icon: Network,
      border: "border-slate-300 hover:border-slate-500",
      bg: "bg-white",
      badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
      badgeText: "text-slate-800",
      accentBg: "bg-slate-800 text-white",
      accentText: "text-slate-700",
    },
    systems: {
      icon: Server,
      border: "border-slate-300 hover:border-slate-500",
      bg: "bg-white",
      badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
      badgeText: "text-slate-800",
      accentBg: "bg-slate-800 text-white",
      accentText: "text-slate-700",
    },
    services: {
      icon: Layers,
      border: "border-slate-300 hover:border-slate-500",
      bg: "bg-white",
      badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
      badgeText: "text-slate-800",
      accentBg: "bg-slate-800 text-white",
      accentText: "text-slate-700",
    },
    retired: {
      icon: Award,
      border: "border-slate-300 hover:border-slate-500",
      bg: "bg-white",
      badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
      badgeText: "text-slate-800",
      accentBg: "bg-slate-700 text-white",
      accentText: "text-slate-700",
    },
  };

  const allDisplayNodes = $derived([...allActiveNodes, ...retiredMembers]);

  const filteredNodes = $derived(
    allDisplayNodes.filter((n) => {
      const matchCat =
        selectedCategory === "all" || n.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        n.name.toLowerCase().includes(q) ||
        n.role.toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q) ||
        (n.honoraryTitle && n.honoraryTitle.toLowerCase().includes(q)) ||
        (n.retiredYear && n.retiredYear.toLowerCase().includes(q)) ||
        n.responsibilities.some((r) => r.toLowerCase().includes(q)) ||
        (n.skills && n.skills.some((s) => s.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    }),
  );

  const rootCfg = $derived(categoryConfig[chart.category]);
  const RootIcon = $derived(rootCfg.icon);
  const isRootCollapsed = $derived(Boolean(collapsedNodes[chart.id]));
</script>

<svelte:window onkeydown={handleKeyDown} />

<section
  class="management-tree-section mb-14"
  aria-label="CSNIS Management Tree"
>
  <!-- Top Header with Admin Edit Controls -->
  <div
    class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <div
        class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5"
      >
        <GitFork size={15} />
        Management Structure
      </div>
      <h2
        class="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5"
      >
        <span>ผังโครงสร้างการบริหาร CSNIS</span>
        {#if hasUnsavedChanges}
          <span
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300"
          >
            ● มีการแก้ไขที่ยังไม่บันทึก
          </span>
        {/if}
      </h2>
      <p class="mt-1 text-sm text-slate-600">
        แผนผังสายการบังคับบัญชา หน้าที่ความรับผิดชอบ และทำเนียบสมาชิกเกษียณอายุ
      </p>
    </div>

    <!-- Admin Edit Mode Trigger & View Modes -->
    <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
      <!-- Admin Unlock Button -->
      {#if !isEditMode}
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer"
          onclick={() => (showPinModal = true)}
          title="ปลดล็อกเพื่อแก้ไขผังการบริหาร (ใช้รหัสผ่านเดียวกับ Topology)"
        >
          <Lock size={14} class="text-slate-500" />
          <span>แก้ไขผังบริหาร</span>
        </button>
      {:else}
        <div
          class="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800"
        >
          <Unlock size={14} class="text-slate-700" />
          <span>Admin Edit Mode</span>
          <button
            type="button"
            class="ml-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            onclick={() => (isEditMode = false)}
            title="ออกจากโหมดแก้ไข"
          >
            <X size={14} />
          </button>
        </div>
      {/if}

      <!-- View Switcher -->
      <div
        class="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1"
      >
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer {viewMode ===
          'tree'
            ? 'bg-white text-slate-900 shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'}"
          onclick={() => (viewMode = "tree")}
        >
          <GitFork size={14} />
          <span>Tree Map</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer {viewMode ===
          'grid'
            ? 'bg-white text-slate-900 shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'}"
          onclick={() => (viewMode = "grid")}
        >
          <LayoutGrid size={14} />
          <span>Card View</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer {viewMode ===
          'retired'
            ? 'bg-white text-slate-900 shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'}"
          onclick={() => (viewMode = "retired")}
          title="ดูทำเนียบสมาชิกเกษียณอายุและอาจารย์อาวุโส"
        >
          <Award size={14} />
          <span>สมาชิกเกษียณอายุ ({retiredMembers.length})</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Admin Action Toolbar (Visible when in Edit Mode) -->
  {#if isEditMode}
    <div
      class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-xs animate-in fade-in duration-200"
    >
      <div class="flex items-center gap-2">
        <div
          class="grid size-8 place-items-center rounded-lg bg-slate-900 text-white shadow-2xs"
        >
          <Edit3 size={16} />
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-900">
            โหมดแก้ไขโครงสร้างองค์กร (Admin Edit Active)
          </h4>
          <p class="text-[11px] text-slate-600">
            คุณสามารถเพิ่ม/แก้ไข/ลบสมาชิก และบันทึกลงไฟล์ JSON เซิร์ฟเวอร์ได้โดยตรง
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Add Active Member Button -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          onclick={() => openAddModal(false)}
        >
          <Plus size={14} />
          <span>เพิ่มตำแหน่งใหม่</span>
        </button>

        <!-- Add Retired Member Button -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          onclick={() => openAddModal(true)}
        >
          <Award size={14} />
          <span>+ สมาชิกเกษียณ</span>
        </button>

        <!-- Save to Server Button -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          onclick={handleSaveServer}
          disabled={isSaving}
        >
          <Save size={14} />
          <span>{isSaving ? "กำลังบันทึก..." : "บันทึกลงเซิร์ฟเวอร์"}</span>
        </button>

        <!-- Export JSON -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          onclick={handleExportJson}
          title="ดาวน์โหลดข้อมูลเป็นไฟล์ JSON"
        >
          <Download size={14} />
          <span>Export JSON</span>
        </button>

        <!-- Import JSON -->
        <label
          class="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          title="นำเข้าข้อมูลจากไฟล์ JSON"
        >
          <Upload size={14} />
          <span>Import JSON</span>
          <input
            type="file"
            accept=".json"
            class="hidden"
            onchange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleImportJson(file);
            }}
          />
        </label>

        <!-- Reset Default -->
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          onclick={handleResetServer}
          title="รีเซ็ตผังกลับเป็นค่าเริ่มต้น"
        >
          <Undo2 size={13} />
          <span>รีเซ็ต</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Search and Category Filter Toolbar -->
  <div
    class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs"
  >
    <!-- Search Bar -->
    <div class="relative min-w-[240px] flex-1">
      <Search
        size={16}
        class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="ค้นหาตำแหน่ง, ชื่อฝ่าย, หรือหน้าที่ความรับผิดชอบ..."
        class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-hidden"
      />
      {#if searchQuery}
        <button
          type="button"
          class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          onclick={() => (searchQuery = "")}
          aria-label="ล้างคำค้นหา"
        >
          <X size={14} />
        </button>
      {/if}
    </div>

    <!-- Category Filter Chips -->
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer {selectedCategory ===
        'all'
          ? 'bg-slate-900 text-white font-semibold shadow-xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
        onclick={() => (selectedCategory = "all")}
      >
        ทุกฝ่าย ({allDisplayNodes.length})
      </button>

      <button
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer {selectedCategory ===
        'executive'
          ? 'bg-slate-900 text-white font-semibold shadow-xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
        onclick={() => (selectedCategory = "executive")}
      >
        ฝ่ายบริหาร
      </button>

      <button
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer {selectedCategory ===
        'network'
          ? 'bg-slate-900 text-white font-semibold shadow-xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
        onclick={() => (selectedCategory = "network")}
      >
        เครือข่าย & ความปลอดภัย
      </button>

      <button
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer {selectedCategory ===
        'systems'
          ? 'bg-slate-900 text-white font-semibold shadow-xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
        onclick={() => (selectedCategory = "systems")}
      >
        ระบบแม่ข่าย & คลาวด์
      </button>

      <button
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer {selectedCategory ===
        'services'
          ? 'bg-slate-900 text-white font-semibold shadow-xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
        onclick={() => (selectedCategory = "services")}
      >
        บริการ & แอปพลิเคชัน
      </button>

      <button
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer {selectedCategory ===
        'retired'
          ? 'bg-slate-900 text-white font-semibold shadow-xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
        onclick={() => (selectedCategory = "retired")}
      >
        สมาชิกเกษียณอายุ ({retiredMembers.length})
      </button>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- 1. TREE VIEW -->
  <!-- ======================================================== -->
  {#if viewMode === "tree"}
    <div
      class="tree-canvas-wrapper relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner sm:p-8"
    >
      <!-- Zoom & Controls Float Bar -->
      <div
        class="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-xs backdrop-blur-md"
      >
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          onclick={handleZoomIn}
          title="ขยาย (Zoom In)"
          aria-label="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        <span
          class="px-1 text-[11px] font-mono font-medium text-slate-500 select-none"
        >
          {Math.round(zoomScale * 100)}%
        </span>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          onclick={handleZoomOut}
          title="ย่อ (Zoom Out)"
          aria-label="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          onclick={handleZoomReset}
          title="รีเซ็ตขนาด (Reset)"
          aria-label="Reset Zoom"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <!-- Hint Badge -->
      <div
        class="absolute bottom-4 left-4 z-20 hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"
      >
        <Sparkles size={13} class="text-slate-400" />
        <span>คลิกที่การ์ดเพื่อดูหน้าที่ความรับผิดชอบ และช่องทางติดต่อ</span>
      </div>

      <!-- Scrollable Tree Container -->
      <div class="overflow-x-auto pb-6 pt-4">
        <div
          class="tree-container min-w-[860px] flex flex-col items-center transition-transform duration-200 origin-top"
          style="transform: scale({zoomScale});"
        >
          <!-- ROOT NODE: Executive Board -->
          <div class="relative flex flex-col items-center">
            <!-- Root Card -->
            <div class="relative group">
              <button
                type="button"
                class="tree-node-card relative flex w-[360px] flex-col rounded-2xl border {rootCfg.border} {rootCfg.bg} p-5 text-left shadow-md transition-all duration-300 hover:scale-102 hover:shadow-xl cursor-pointer"
                onclick={() => selectNode(chart)}
              >
                <!-- Top Badge -->
                <div class="flex items-center justify-between gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold {rootCfg.badgeBg}"
                  >
                    <RootIcon size={12} />
                    {chart.department}
                  </span>

                  <span
                    class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wide border border-slate-200"
                  >
                    {chart.badge}
                  </span>
                </div>

                <!-- Main Title & Role -->
                <div class="mt-3.5 flex items-start gap-3">
                  {#if chart.avatar}
                    <img
                      src={chart.avatar}
                      alt={chart.name}
                      class="size-11 shrink-0 rounded-xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                    />
                  {:else}
                    <div
                      class="grid size-10 shrink-0 place-items-center rounded-xl {rootCfg.accentBg} shadow-xs"
                    >
                      <RootIcon size={20} />
                    </div>
                  {/if}
                  <div>
                    <h3
                      class="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors"
                    >
                      {chart.name}
                    </h3>
                    <p class="text-xs font-medium text-slate-600">
                      {chart.role}
                    </p>
                  </div>
                </div>

                <!-- Location & Details preview -->
                <div
                  class="mt-3.5 flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-xs text-slate-500"
                >
                  <span class="flex items-center gap-1 text-[11.5px]">
                    <MapPin size={12} class="text-slate-400" />
                    {chart.room}
                  </span>
                  <span class="text-slate-600 font-medium group-hover:text-slate-900 group-hover:underline">
                    ดูรายละเอียด →
                  </span>
                </div>
              </button>

              <!-- Edit Mode Controls on Root -->
              {#if isEditMode}
                <div
                  class="absolute -top-3 -right-3 z-30 flex items-center gap-1"
                >
                  <button
                    type="button"
                    class="grid size-7 place-items-center rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
                    onclick={(e) => {
                      e.stopPropagation();
                      openEditModal(chart);
                    }}
                    title="แก้ไขข้อมูลตำแหน่งนี้"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    class="grid size-7 place-items-center rounded-full bg-slate-700 text-white shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
                    onclick={(e) => {
                      e.stopPropagation();
                      openAddModal(false, chart.id);
                    }}
                    title="เพิ่มตำแหน่งลูกใต้ฝ่ายนี้"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              {/if}
            </div>

            <!-- Collapse Toggle for Root -->
            {#if chart.children && chart.children.length > 0}
              <button
                type="button"
                class="mt-2 z-10 grid size-6 place-items-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-xs hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                onclick={(e) => toggleCollapse(chart.id, e)}
                title={isRootCollapsed ? "แสดงฝ่ายย่อย" : "ซ่อนฝ่ายย่อย"}
                aria-label="Toggle Root Children"
              >
                {#if isRootCollapsed}
                  <ChevronRight size={14} />
                {:else}
                  <ChevronDown size={14} />
                {/if}
              </button>
            {/if}

            <!-- CONNECTOR LINE DOWN FROM ROOT -->
            {#if !isRootCollapsed && chart.children}
              <div class="h-8 w-0.5 bg-slate-300"></div>

              <!-- LEVEL 2: 3 DIVISIONS CONTAINER -->
              <div class="relative flex justify-center gap-6 pt-4">
                <!-- Horizontal Bus Line connecting the divisions -->
                <div
                  class="absolute top-0 left-[16%] right-[16%] h-0.5 bg-slate-300"
                ></div>

                <!-- Iterate Division Leads -->
                {#each chart.children as division (division.id)}
                  {@const divCfg = categoryConfig[division.category]}
                  {@const DivIcon = divCfg.icon}
                  {@const isDivCollapsed = collapsedNodes[division.id]}

                  <div class="relative flex flex-col items-center">
                    <!-- Vertical tick down to Division Card -->
                    <div class="absolute -top-4 h-4 w-0.5 bg-slate-300"></div>

                    <!-- Division Card Wrapper -->
                    <div class="relative group">
                      <button
                        type="button"
                        class="tree-node-card relative flex w-[265px] flex-col rounded-2xl border {divCfg.border} {divCfg.bg} p-4 text-left shadow-xs transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer"
                        onclick={() => selectNode(division)}
                      >
                        <!-- Top Badge -->
                        <div class="flex items-center justify-between gap-1">
                          <span
                            class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold {divCfg.badgeBg}"
                          >
                            <DivIcon size={11} />
                            {division.badge}
                          </span>

                          <span
                            class="text-[10.5px] font-medium text-slate-500"
                          >
                            {division.children?.length || 0} ทีมย่อย
                          </span>
                        </div>

                        <!-- Role & Name -->
                        <div class="mt-2.5 flex items-start gap-2.5">
                          {#if division.avatar}
                            <img
                              src={division.avatar}
                              alt={division.name}
                              class="size-9 shrink-0 rounded-lg object-cover border border-white shadow-xs ring-1 ring-slate-200"
                            />
                          {:else}
                            <div
                              class="grid size-8 shrink-0 place-items-center rounded-lg {divCfg.accentBg} shadow-2xs"
                            >
                              <DivIcon size={16} />
                            </div>
                          {/if}
                          <div>
                            <h4
                              class="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors leading-snug"
                            >
                              {division.name}
                            </h4>
                            <p
                              class="text-[11px] font-medium text-slate-600 mt-0.5"
                            >
                              {division.role}
                            </p>
                          </div>
                        </div>

                        <!-- Quick Skill Chips -->
                        {#if division.skills}
                          <div
                            class="mt-2.5 flex flex-wrap gap-1 border-t border-slate-200/60 pt-2"
                          >
                            {#each division.skills.slice(0, 2) as skill}
                              <span
                                class="rounded-md bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 text-[9.5px] text-slate-600 font-mono"
                              >
                                {skill}
                              </span>
                            {/each}
                          </div>
                        {/if}
                      </button>

                      <!-- Edit Mode Buttons on Division Card -->
                      {#if isEditMode}
                        <div
                          class="absolute -top-2 -right-2 z-30 flex items-center gap-1"
                        >
                          <button
                            type="button"
                            class="grid size-6 place-items-center rounded-full bg-slate-900 text-white shadow-xs hover:bg-slate-800 cursor-pointer"
                            onclick={(e) => {
                              e.stopPropagation();
                              openEditModal(division);
                            }}
                            title="แก้ไขฝ่ายนี้"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            type="button"
                            class="grid size-6 place-items-center rounded-full bg-slate-700 text-white shadow-xs hover:bg-slate-800 cursor-pointer"
                            onclick={(e) => {
                              e.stopPropagation();
                              openAddModal(false, division.id);
                            }}
                            title="เพิ่มสมาชิกใต้ฝ่ายนี้"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            class="grid size-6 place-items-center rounded-full bg-slate-600 text-white shadow-xs hover:bg-slate-800 cursor-pointer"
                            onclick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(division.id, false);
                            }}
                            title="ลบฝ่ายนี้"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      {/if}
                    </div>

                    <!-- Collapse Toggle for Sub-team -->
                    {#if division.children && division.children.length > 0}
                      <button
                        type="button"
                        class="mt-2 z-10 grid size-5 place-items-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        onclick={(e) => toggleCollapse(division.id, e)}
                        title={isDivCollapsed
                          ? "แสดงวิศวกรย่อย"
                          : "ซ่อนวิศวกรย่อย"}
                        aria-label="Toggle Division Children"
                      >
                        {#if isDivCollapsed}
                          <ChevronRight size={12} />
                        {:else}
                          <ChevronDown size={12} />
                        {/if}
                      </button>
                    {/if}

                    <!-- LEVEL 3: Engineers & Specialists -->
                    {#if !isDivCollapsed && division.children}
                      <div class="h-6 w-0.5 bg-slate-300"></div>

                      <div class="flex flex-col gap-3">
                        {#each division.children as specialist (specialist.id)}
                          {@const specCfg = categoryConfig[specialist.category]}
                          {@const SpecIcon = specCfg.icon}

                          <div class="relative group">
                            <button
                              type="button"
                              class="relative flex w-[265px] flex-col rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-2xs transition-all duration-200 hover:border-slate-400 hover:shadow-md cursor-pointer"
                              onclick={() => selectNode(specialist)}
                            >
                              <div
                                class="flex items-start justify-between gap-1"
                              >
                                <span
                                  class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-medium {specCfg.badgeBg}"
                                >
                                  {specialist.badge}
                                </span>
                                <span class="text-[10px] text-slate-400">
                                  {specialist.room}
                                </span>
                              </div>

                              <div class="mt-2 flex items-start gap-2">
                                {#if specialist.avatar}
                                  <img
                                    src={specialist.avatar}
                                    alt={specialist.name}
                                    class="size-7 shrink-0 rounded-md object-cover border border-white shadow-2xs"
                                  />
                                {:else}
                                  <div
                                    class="grid size-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors"
                                  >
                                    <SpecIcon size={13} />
                                  </div>
                                {/if}
                                <div>
                                  <h5
                                    class="text-xs font-bold text-slate-900 leading-snug group-hover:text-slate-700 transition-colors"
                                  >
                                    {specialist.name}
                                  </h5>
                                  <p
                                    class="text-[10.5px] text-slate-500 leading-tight mt-0.5"
                                  >
                                    {specialist.role}
                                  </p>
                                </div>
                              </div>
                            </button>

                            <!-- Edit Buttons on Specialist Card -->
                            {#if isEditMode}
                              <div
                                class="absolute -top-2 -right-2 z-30 flex items-center gap-1"
                              >
                                <button
                                  type="button"
                                  class="grid size-5 place-items-center rounded-full bg-slate-900 text-white shadow-xs hover:bg-slate-800 cursor-pointer"
                                  onclick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(specialist);
                                  }}
                                  title="แก้ไข"
                                >
                                  <Edit3 size={10} />
                                </button>
                                <button
                                  type="button"
                                  class="grid size-5 place-items-center rounded-full bg-slate-600 text-white shadow-xs hover:bg-slate-800 cursor-pointer"
                                  onclick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNode(specialist.id, false);
                                  }}
                                  title="ลบ"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. CARD / GRID VIEW -->
    <!-- ======================================================== -->
  {:else if viewMode === "grid"}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredNodes as node (node.id)}
        {@const cfg = categoryConfig[node.category]}
        {@const Icon = cfg.icon}

        <div class="relative group">
          <button
            type="button"
            class="panel relative flex w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:border-slate-400 hover:shadow-md cursor-pointer"
            onclick={() => selectNode(node)}
          >
            <div>
              <!-- Top bar -->
              <div class="flex items-center justify-between gap-2">
                <span
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold {cfg.badgeBg}"
                >
                  <Icon size={11} />
                  {node.department}
                </span>

                <span
                  class="text-[11px] font-semibold text-slate-400"
                >
                  {node.badge}
                </span>
              </div>

              <!-- Title & Role -->
              <div class="mt-3.5 flex items-start gap-3">
                {#if node.avatar}
                  <img
                    src={node.avatar}
                    alt={node.name}
                    class="size-10 shrink-0 rounded-xl object-cover border-2 border-white shadow-xs ring-1 ring-slate-200"
                  />
                {:else}
                  <div
                    class="grid size-9 shrink-0 place-items-center rounded-xl {cfg.accentBg} shadow-2xs"
                  >
                    <Icon size={18} />
                  </div>
                {/if}
                <div>
                  <h3
                    class="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors"
                  >
                    {node.name}
                  </h3>
                  <p class="text-xs font-medium text-slate-600 mt-0.5">
                    {node.role}
                  </p>
                  {#if node.retiredYear}
                    <span
                      class="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1"
                    >
                      <Calendar size={11} /> เกษียณปี {node.retiredYear}
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Responsibilities summary -->
              <div class="mt-3.5 space-y-1 border-t border-slate-100 pt-3">
                {#each node.responsibilities.slice(0, 2) as resp}
                  <div class="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2
                      size={13}
                      class="text-slate-400 shrink-0 mt-0.5"
                    />
                    <span class="line-clamp-1">{resp}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Bottom bar -->
            <div
              class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"
            >
              <span class="flex items-center gap-1">
                <MapPin size={12} class="text-slate-400" />
                {node.room}
              </span>

              <span class="font-medium text-slate-600 group-hover:text-slate-900 group-hover:underline">
                ดูข้อมูลเพิ่มเติม →
              </span>
            </div>
          </button>

          <!-- Edit Mode Actions in Grid View -->
          {#if isEditMode}
            <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5">
              <button
                type="button"
                class="grid size-7 place-items-center rounded-full bg-white border border-slate-300 text-slate-700 shadow-sm hover:bg-slate-100 cursor-pointer"
                onclick={(e) => {
                  e.stopPropagation();
                  openEditModal(node);
                }}
                title="แก้ไขข้อมูล"
              >
                <Edit3 size={12} />
              </button>
              {#if node.id !== chart.id}
                <button
                  type="button"
                  class="grid size-7 place-items-center rounded-full bg-white border border-slate-300 text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  onclick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id, Boolean(node.isRetired));
                  }}
                  title="ลบ"
                >
                  <Trash2 size={12} />
                </button>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- ======================================================== -->
    <!-- 3. RETIRED MEMBERS VIEW (ทำเนียบสมาชิกเกษียณอายุ) -->
    <!-- ======================================================== -->
  {:else if viewMode === "retired"}
    <div class="space-y-6">
      <!-- Section Banner -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div class="flex items-start gap-3.5">
          <div
            class="grid size-12 place-items-center rounded-2xl bg-slate-900 text-white shadow-md"
          >
            <Award size={24} />
          </div>
          <div>
            <div class="eyebrow" style="color: #64748b; margin-bottom: 4px;">
              Honorary & Retired Members
            </div>
            <h3 class="text-xl font-bold text-slate-900">
              ทำเนียบสมาชิกเกษียณอายุและศิษย์เก่า CSNIS
            </h3>
            <p class="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              เกียรติประวัติอาจารย์อาวุโส อดีตหัวหน้าโครงการ
              และผู้บุกเบิกโครงสร้างพื้นฐานเครือข่าย CSNIS
              ภาควิชาวิทยาการคอมพิวเตอร์ สจล.
            </p>
          </div>
        </div>

        {#if isEditMode}
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
            onclick={() => openAddModal(true)}
          >
            <Plus size={14} />
            <span>เพิ่มสมาชิกเกษียณ</span>
          </button>
        {/if}
      </div>

      <!-- Retired Members Cards Grid -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each retiredMembers as ret (ret.id)}
          <div class="relative group">
            <button
              type="button"
              class="panel relative flex w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:border-slate-400 hover:shadow-md cursor-pointer"
              onclick={() => selectNode(ret)}
            >
              <div>
                <!-- Top Badge & Tenure -->
                <div class="flex items-center justify-between gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-700"
                  >
                    <Award size={12} class="text-slate-600" />
                    {ret.badge}
                  </span>

                  {#if ret.retiredYear}
                    <span
                      class="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                    >
                      วาระ {ret.retiredYear}
                    </span>
                  {/if}
                </div>

                <!-- Name & Role -->
                <div class="mt-4 flex items-start gap-3">
                  {#if ret.avatar}
                    <img
                      src={ret.avatar}
                      alt={ret.name}
                      class="size-12 shrink-0 rounded-xl object-cover border-2 border-white shadow-xs ring-1 ring-slate-200"
                    />
                  {:else}
                    <div
                      class="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-white shadow-2xs"
                    >
                      <Award size={20} />
                    </div>
                  {/if}
                  <div>
                    <h4
                      class="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors"
                    >
                      {ret.name}
                    </h4>
                    <p class="text-xs font-medium text-slate-600 mt-0.5">
                      {ret.role}
                    </p>
                  </div>
                </div>

                <!-- Honorary Title -->
                {#if ret.honoraryTitle}
                  <div
                    class="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-800 font-medium flex items-center gap-1.5"
                  >
                    <Sparkles size={13} class="text-slate-500 shrink-0" />
                    <span>{ret.honoraryTitle}</span>
                  </div>
                {/if}

                <!-- Legacy Contributions -->
                <div class="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                  <div
                    class="text-[10.5px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    ผลงานและบทบาทสำคัญ:
                  </div>
                  {#each ret.responsibilities.slice(0, 2) as resp}
                    <div class="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2
                        size={13}
                        class="text-slate-400 shrink-0 mt-0.5"
                      />
                      <span class="line-clamp-2">{resp}</span>
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Bottom Bar -->
              <div
                class="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"
              >
                <span class="flex items-center gap-1">
                  <MapPin size={12} class="text-slate-400" />
                  {ret.room}
                </span>

                <span
                  class="font-medium text-slate-700 group-hover:text-slate-900 group-hover:underline"
                >
                  ดูเกียรติประวัติ →
                </span>
              </div>
            </button>

            <!-- Edit / Delete for Retired -->
            {#if isEditMode}
              <div
                class="absolute top-4 right-4 z-30 flex items-center gap-1.5"
              >
                <button
                  type="button"
                  class="grid size-7 place-items-center rounded-full bg-white border border-slate-300 text-slate-700 shadow-sm hover:bg-slate-100 cursor-pointer"
                  onclick={(e) => {
                    e.stopPropagation();
                    openEditModal(ret);
                  }}
                  title="แก้ไขข้อมูลสมาชิกเกษียณ"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  type="button"
                  class="grid size-7 place-items-center rounded-full bg-white border border-slate-300 text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  onclick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(ret.id, true);
                  }}
                  title="ลบ"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</section>

<!-- ======================================================== -->
<!-- ADMIN PIN MODAL (Uses same PIN as Topology) -->
<!-- ======================================================== -->
{#if showPinModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    role="dialog"
    aria-modal="true"
    aria-labelledby="pin-modal-title"
  >
    <div
      class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
    >
      <div
        class="flex items-center justify-between border-b border-slate-100 pb-3"
      >
        <div class="flex items-center gap-2">
          <div
            class="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-800"
          >
            <KeyRound size={18} />
          </div>
          <h3 id="pin-modal-title" class="text-sm font-bold text-slate-900">
            ปลดล็อกโหมดแก้ไขผังบริหาร (Admin Mode)
          </h3>
        </div>

        <button
          type="button"
          class="text-slate-400 hover:text-slate-700 cursor-pointer"
          onclick={() => {
            showPinModal = false;
            pin = "";
            pinError = "";
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onsubmit={handleAuthenticate} class="mt-4 space-y-4">
        <p class="text-xs text-slate-600 leading-relaxed">
          ป้อน Admin PIN เพื่อแก้ไขตำแหน่ง สมาชิก และทำเนียบผู้เกษียณอายุ
          (ใช้รหัสผ่านชุดเดียวกับระบบ Topology)
        </p>

        {#if pinError}
          <div
            class="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700"
          >
            <AlertCircle size={15} class="shrink-0" />
            <span>{pinError}</span>
          </div>
        {/if}

        <div>
          <label
            for="admin-pin-org"
            class="block text-xs font-semibold text-slate-700 mb-1"
          >
            Admin PIN
          </label>
          <input
            id="admin-pin-org"
            type="password"
            bind:value={pin}
            placeholder="ป้อนรหัส PIN (เริ่มต้น: 1234)"
            autocomplete="current-password"
            required
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            onclick={() => {
              showPinModal = false;
              pin = "";
              pinError = "";
            }}
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            disabled={pinLoading}
            class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Unlock size={14} />
            <span>{pinLoading ? "กำลังตรวจสอบ..." : "ปลดล็อก"}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- ======================================================== -->
<!-- NODE DETAIL MODAL / DRAWER -->
<!-- ======================================================== -->
{#if selectedNode}
  {@const mCfg = categoryConfig[selectedNode.category]}
  {@const ModalIcon = mCfg.icon}

  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
    >
      <!-- Close Button -->
      <button
        type="button"
        class="absolute top-5 right-5 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        onclick={closeModal}
        aria-label="ปิดหน้าต่าง"
      >
        <X size={18} />
      </button>

      <!-- Header with Icon & Department -->
      <div class="flex items-start gap-3.5 pr-8">
        {#if selectedNode.avatar}
          <img
            src={selectedNode.avatar}
            alt={selectedNode.name}
            class="size-14 shrink-0 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
          />
        {:else}
          <div
            class="grid size-12 shrink-0 place-items-center rounded-2xl {mCfg.accentBg} shadow-sm"
          >
            <ModalIcon size={24} />
          </div>
        {/if}

        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold {mCfg.badgeBg}"
            >
              {selectedNode.department}
            </span>
            <span
              class="text-xs font-semibold text-slate-400"
            >
              {selectedNode.badge}
            </span>
          </div>

          <h3 id="modal-title" class="mt-1.5 text-lg font-bold text-slate-900">
            {selectedNode.name}
          </h3>
          <p class="text-xs font-medium text-slate-600">
            {selectedNode.role}
          </p>
        </div>
      </div>

      <!-- Quick Contact / Location Info Box -->
      <div
        class="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs"
      >
        <div class="flex items-center gap-2 text-slate-700">
          <MapPin size={15} class="text-slate-500 shrink-0" />
          <div>
            <span class="block text-[10px] text-slate-400"
              >สถานที่ปฏิบัติงาน</span
            >
            <span class="font-medium">{selectedNode.room}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 text-slate-700">
          <Mail size={15} class="text-slate-500 shrink-0" />
          <div class="truncate">
            <span class="block text-[10px] text-slate-400">อีเมลติดต่อ</span>
            <span class="font-medium truncate block">{selectedNode.email}</span>
          </div>
        </div>
      </div>

      <!-- Key Responsibilities or Legacy Contributions -->
      <div class="mt-5">
        <h4
          class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2"
        >
          {#if selectedNode.isRetired}
            <Award size={13} class="text-slate-500" />
            <span>ผลงานและเกียรติประวัติสำคัญ</span>
          {:else}
            <Briefcase size={13} class="text-slate-400" />
            <span>หน้าที่และความรับผิดชอบหลัก</span>
          {/if}
        </h4>

        <div class="space-y-2">
          {#each selectedNode.responsibilities as resp}
            <div class="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2
                size={14}
                class="text-slate-400 shrink-0 mt-0.5"
              />
              <span class="leading-relaxed">{resp}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Technical Skills / Systems Handled -->
      {#if selectedNode.skills && selectedNode.skills.length > 0}
        <div class="mt-5">
          <h4
            class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2"
          >
            <Sparkles size={13} class="text-slate-400" />
            ระบบและทักษะที่เกี่ยวข้อง
          </h4>

          <div class="flex flex-wrap gap-1.5">
            {#each selectedNode.skills as skill}
              <span
                class="rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 text-xs font-mono font-medium text-slate-700"
              >
                {skill}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Footer Buttons -->
      <div
        class="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4"
      >
        {#if isEditMode}
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer mr-auto"
            onclick={() => {
              const node = selectedNode;
              closeModal();
              if (node) openEditModal(node);
            }}
          >
            <Edit3 size={13} />
            <span>แก้ไขข้อมูลตำแหน่งนี้</span>
          </button>
        {/if}

        <a
          href="mailto:{selectedNode.email}"
          class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
        >
          <Mail size={14} />
          <span>ส่งอีเมลติดต่อ</span>
          <ExternalLink size={13} />
        </a>

        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          onclick={closeModal}
        >
          ปิด
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ======================================================== -->
<!-- ORG NODE EDIT / ADD MODAL -->
<!-- ======================================================== -->
<OrgNodeEditModal
  open={showEditModal}
  node={nodeToEdit}
  {availableParents}
  isAddingRetired={isAddingRetiredMember}
  onsave={handleSaveNode}
  onclose={() => {
    showEditModal = false;
    nodeToEdit = null;
  }}
/>

<style>
  .tree-node-card {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
