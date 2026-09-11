<script lang="ts">
  import {
    X,
    Save,
    UserPlus,
    Edit3,
    Briefcase,
    Mail,
    MapPin,
    Sparkles,
    Award,
    CheckCircle2,
    Calendar,
    Camera,
    Trash2,
    Upload,
  } from "lucide-svelte";
  import type { OrgNode } from "$lib/data/orgChart";

  let {
    open = false,
    node = null,
    availableParents = [],
    isAddingRetired = false,
    onsave,
    onclose,
  }: {
    open: boolean;
    node: OrgNode | null;
    availableParents: { id: string; name: string; role: string }[];
    isAddingRetired?: boolean;
    onsave: (updated: OrgNode, parentId?: string) => void;
    onclose: () => void;
  } = $props();

  // Form State
  let name = $state("");
  let role = $state("");
  let department = $state("");
  let category = $state<"executive" | "network" | "systems" | "services" | "retired">("network");
  let badge = $state("");
  let email = $state("");
  let room = $state("");
  let avatar = $state<string | undefined>(undefined);
  let isRetired = $state(false);
  let retiredYear = $state("");
  let honoraryTitle = $state("");
  let responsibilitiesText = $state("");
  let skillsText = $state("");
  let selectedParentId = $state("");
  let isDraggingPhoto = $state(false);

  // Populate form when node changes or modal opens
  $effect(() => {
    if (open) {
      if (node) {
        name = node.name || "";
        role = node.role || "";
        department = node.department || "";
        category = node.category || (node.isRetired ? "retired" : "network");
        badge = node.badge || "";
        email = node.email || "";
        room = node.room || "";
        avatar = node.avatar || undefined;
        isRetired = Boolean(node.isRetired);
        retiredYear = node.retiredYear || "";
        honoraryTitle = node.honoraryTitle || "";
        responsibilitiesText = (node.responsibilities || []).join("\n");
        skillsText = (node.skills || []).join(", ");
        selectedParentId = "";
      } else {
        // Adding new
        isRetired = Boolean(isAddingRetired);
        name = "";
        role = "";
        department = isAddingRetired ? "ทำเนียบสมาชิกเกษียณอายุ" : "Network & Security Division";
        category = isAddingRetired ? "retired" : "network";
        badge = isAddingRetired ? "เกษียณอายุราชการ" : "Staff";
        email = isAddingRetired ? "alumni@cskmitl.com" : "staff@cskmitl.com";
        room = isAddingRetired ? "ทำเนียบศิษย์เก่า CS KMITL" : "พระจอมเกล้า 713";
        avatar = undefined;
        retiredYear = isAddingRetired ? "2566" : "";
        honoraryTitle = isAddingRetired ? "อดีตผู้ดูแลระบบโครงสร้างพื้นฐาน" : "";
        responsibilitiesText = "";
        skillsText = "";
        selectedParentId = availableParents[0]?.id || "exec-head";
      }
    }
  });

  // Client-side image resize and compress to WebP base64
  function processImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP ฯลฯ)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          avatar = canvas.toDataURL("image/webp", 0.85);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleFileInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    target.value = "";
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingPhoto = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }

  function removeAvatar() {
    avatar = undefined;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert("กรุณากรอกชื่อและตำแหน่งงาน");
      return;
    }

    const responsibilities = responsibilitiesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedNode: OrgNode = {
      id: node?.id || `node-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      department: department.trim() || "CSNIS Division",
      category: isRetired ? "retired" : category,
      badge: badge.trim() || (isRetired ? "สมาชิกเกษียณ" : "Staff"),
      email: email.trim() || "contact@cskmitl.com",
      room: room.trim() || "พระจอมเกล้า 713",
      avatar: avatar || undefined,
      isRetired,
      retiredYear: isRetired ? retiredYear.trim() : undefined,
      honoraryTitle: isRetired ? honoraryTitle.trim() : undefined,
      responsibilities: responsibilities.length > 0 ? responsibilities : ["ดูแลและปฏิบัติงานตามที่ได้รับมอบหมาย"],
      skills: skills.length > 0 ? skills : undefined,
      children: node?.children,
    };

    onsave(updatedNode, selectedParentId);
    onclose();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-modal-title"
  >
    <div
      class="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-700">
            {#if node}
              <Edit3 size={18} />
            {:else}
              <UserPlus size={18} />
            {/if}
          </div>
          <div>
            <h3 id="edit-modal-title" class="text-base font-bold text-slate-900">
              {node ? "แก้ไขข้อมูลสมาชิก / ตำแหน่ง" : isAddingRetired ? "เพิ่มสมาชิกที่เกษียณแล้ว / ทำเนียบรุ่นพี่" : "เพิ่มสมาชิกใหม่ในผังบริหาร"}
            </h3>
            <p class="text-xs text-slate-500">
              {node ? `รหัสสมาชิก: ${node.id}` : "กรอกข้อมูลเพื่อแสดงผลบนผังองค์กร"}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          onclick={onclose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <!-- Form -->
      <form onsubmit={handleSubmit} class="mt-5 space-y-4">
        <!-- Photo / Avatar Upload Section -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera size={14} class="text-blue-600" />
              รูปถ่ายสมาชิก (Profile Picture)
            </span>
            <span class="text-[11px] text-slate-500">
              ขนาดภาพจะถูกย่อและบีบอัดเก็บใน JSON อัตโนมัติ
            </span>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4">
            <!-- Avatar Preview Box -->
            <div
              role="region"
              aria-label="Dropzone รูปโปรไฟล์"
              class="relative size-20 shrink-0 rounded-2xl border-2 border-dashed {isDraggingPhoto
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-white'} grid place-items-center overflow-hidden shadow-xs"
              ondragover={(e) => {
                e.preventDefault();
                isDraggingPhoto = true;
              }}
              ondragleave={() => (isDraggingPhoto = false)}
              ondrop={handleDrop}
            >
              {#if avatar}
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  class="size-full object-cover"
                />
              {:else}
                <div class="flex flex-col items-center text-slate-400">
                  <Camera size={22} />
                  <span class="text-[9px] mt-1 font-medium">ยังไม่มีรูป</span>
                </div>
              {/if}
            </div>

            <!-- Upload Controls -->
            <div class="flex-1 flex flex-wrap items-center gap-2">
              <label
                class="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Upload size={14} class="text-blue-600" />
                <span>{avatar ? "เปลี่ยนรูปภาพ" : "อัปโหลดรูปภาพ"}</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onchange={handleFileInput}
                />
              </label>

              {#if avatar}
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  onclick={removeAvatar}
                >
                  <Trash2 size={13} />
                  <span>ลบรูปภาพ</span>
                </button>
              {/if}

              <p class="text-[11px] text-slate-500 w-full mt-1">
                รองรับไฟล์ภาพ JPG, PNG, WebP หรือลากไฟล์มาวางในช่องได้ทันที
              </p>
            </div>
          </div>
        </div>

        <!-- Status Switch: Is Retired? -->
        <div class="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5">
          <div class="flex items-center gap-2.5">
            <Award size={20} class="text-amber-600" />
            <div>
              <span class="text-xs font-bold text-slate-900 block">
                สมาชิกที่เกษียณแล้ว / ทำเนียบเกียรติยศ (Retired / Emeritus)
              </span>
              <span class="text-[11px] text-slate-500">
                ทำเครื่องหมายหากเป็นอาจารย์อาวุโส อดีตผู้ดูแลระบบ หรือศิษย์เก่าที่พ้นวาระ
              </span>
            </div>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={isRetired}
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        <!-- Retired Specific Info -->
        {#if isRetired}
          <div class="grid gap-3 sm:grid-cols-2 rounded-xl border border-amber-200 bg-amber-50/30 p-3.5">
            <div>
              <label for="ret-year" class="block text-xs font-semibold text-slate-700 mb-1">
                ปีที่เกษียณ / วาระการทำงาน
              </label>
              <input
                id="ret-year"
                type="text"
                bind:value={retiredYear}
                placeholder="เช่น 2566 (2023) หรือ 2018 - 2024"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label for="ret-title" class="block text-xs font-semibold text-slate-700 mb-1">
                ฉายาเกียรติยศ / บทบาทสำคัญ
              </label>
              <input
                id="ret-title"
                type="text"
                bind:value={honoraryTitle}
                placeholder="เช่น ผู้ร่วมก่อตั้งโครงสร้างพื้นฐาน CSNIS"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        {/if}

        <!-- Name & Role -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="member-name" class="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อ - สกุล / ชื่อตำแหน่งทางการ <span class="text-red-500">*</span>
            </label>
            <input
              id="member-name"
              type="text"
              bind:value={name}
              placeholder="เช่น นายวิทยา เครือข่ายมั่นคง"
              required
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label for="member-role" class="block text-xs font-semibold text-slate-700 mb-1">
              ตำแหน่งงาน (Role) <span class="text-red-500">*</span>
            </label>
            <input
              id="member-role"
              type="text"
              bind:value={role}
              placeholder="เช่น Network Operations Lead"
              required
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <!-- Department & Category -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="member-dept" class="block text-xs font-semibold text-slate-700 mb-1">
              ฝ่าย / สังกัด (Department)
            </label>
            <input
              id="member-dept"
              type="text"
              bind:value={department}
              placeholder="เช่น Network & Security Division"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {#if !isRetired}
            <div>
              <label for="member-category" class="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่สายงาน (Category)
              </label>
              <select
                id="member-category"
                bind:value={category}
                class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
              >
                <option value="executive">Executive Board (ฝ่ายบริหาร)</option>
                <option value="network">Network & Security (เครือข่าย & ความปลอดภัย)</option>
                <option value="systems">Systems & Virtualization (ระบบแม่ข่าย & คลาวด์)</option>
                <option value="services">Digital Services (บริการ & แอปพลิเคชัน)</option>
              </select>
            </div>
          {/if}
        </div>

        <!-- If creating a new active node, choose Parent Node in tree -->
        {#if !node && !isRetired && availableParents.length > 0}
          <div>
            <label for="parent-select" class="block text-xs font-semibold text-slate-700 mb-1">
              สังกัดภายใต้ตำแหน่ง (Parent in Tree Map)
            </label>
            <select
              id="parent-select"
              bind:value={selectedParentId}
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
            >
              {#each availableParents as parent}
                <option value={parent.id}>{parent.name} ({parent.role})</option>
              {/each}
            </select>
          </div>
        {/if}

        <!-- Badge & Room -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="member-badge" class="block text-xs font-semibold text-slate-700 mb-1">
              ป้ายกำกับ / Badge Tag
            </label>
            <input
              id="member-badge"
              type="text"
              bind:value={badge}
              placeholder="เช่น Core Network, Cloud & VM, Staff"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label for="member-room" class="block text-xs font-semibold text-slate-700 mb-1">
              สถานที่ปฏิบัติงาน (Office / Room)
            </label>
            <input
              id="member-room"
              type="text"
              bind:value={room}
              placeholder="เช่น พระจอมเกล้า 713"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="member-email" class="block text-xs font-semibold text-slate-700 mb-1">
            อีเมลติดต่อ (Email)
          </label>
          <input
            id="member-email"
            type="email"
            bind:value={email}
            placeholder="เช่น contact@cskmitl.com"
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <!-- Responsibilities (Multiline) -->
        <div>
          <label for="member-resp" class="block text-xs font-semibold text-slate-700 mb-1">
            หน้าที่และความรับผิดชอบหลัก (1 บรรทัด = 1 ข้อย่อย)
          </label>
          <textarea
            id="member-resp"
            rows="3"
            bind:value={responsibilitiesText}
            placeholder="ดูแลระบบเซิร์ฟเวอร์หลักของภาควิชา&#10;ควบคุมนโยบายการสำรองข้อมูล (Backup)&#10;ตรวจสอบความปลอดภัยของเครือข่าย"
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
          ></textarea>
        </div>

        <!-- Skills (Comma-separated) -->
        <div>
          <label for="member-skills" class="block text-xs font-semibold text-slate-700 mb-1">
            ทักษะ / เทคโนโลยีที่เกี่ยวข้อง (คั่นด้วยเครื่องหมายจุลภาค ,)
          </label>
          <input
            id="member-skills"
            type="text"
            bind:value={skillsText}
            placeholder="เช่น Proxmox, Linux, WireGuard, VLAN, OPNsense"
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            onclick={onclose}
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            class="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Save size={14} />
            <span>{node ? "บันทึกการแก้ไข" : "เพิ่มสมาชิก"}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
