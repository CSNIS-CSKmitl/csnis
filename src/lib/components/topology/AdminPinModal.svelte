<script lang="ts">
  import { Lock, Unlock, X, KeyRound, AlertCircle } from 'lucide-svelte';

  let { open = $bindable(false), onsuccess }: { open: boolean; onsuccess: () => void } = $props();

  let pin = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleAuthenticate(e: Event) {
    e.preventDefault();
    if (!pin.trim()) {
      error = 'กรุณากรอก Admin PIN';
      return;
    }

    loading = true;
    error = '';

    try {
      const res = await fetch('/api/monitoring/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onsuccess();
        open = false;
        pin = '';
      } else {
        error = data.message || 'Admin PIN ไม่ถูกต้อง';
      }
    } catch {
      error = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อตรวจสอบ PIN ได้';
    } finally {
      loading = false;
    }
  }

  function close() {
    open = false;
    pin = '';
    error = '';
  }
</script>

{#if open}
  <div class="modal-backdrop" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()} role="button" tabindex="-1" aria-label="Close modal background">
    <div class="modal-card" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="0">

      <div class="modal-header">
        <div class="flex items-center gap-2 font-semibold text-slate-800 text-base">
          <div class="rounded-full bg-blue-100 p-2 text-blue-700">
            <KeyRound size={20} />
          </div>
          <span>ปลดล็อก Admin Edit Mode</span>
        </div>
        <button class="close-btn" onclick={close} aria-label="Close dialog">
          <X size={18} />
        </button>
      </div>

      <form onsubmit={handleAuthenticate} class="modal-body">
        <p class="text-xs text-slate-600 mb-4">
          กรอก Admin PIN เพื่อปลดล็อกโหมดแก้ไขแผนผังเครือข่าย (ลากวาง Node, เพิ่ม/แก้ไข IP อุปกรณ์)
        </p>

        {#if error}
          <div class="error-box">
            <AlertCircle size={16} class="shrink-0" />
            <span>{error}</span>
          </div>
        {/if}

        <div class="form-group">
          <label for="admin-pin-input" class="text-xs font-medium text-slate-700 mb-1 block">Admin PIN</label>
          <input
            id="admin-pin-input"
            type="password"
            bind:value={pin}
            placeholder="ป้อนรหัส PIN (เริ่มต้น: 1234)"
            class="input-field"
            autocomplete="current-password"
            required
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick={close}>ยกเลิก</button>
          <button type="submit" class="btn-submit" disabled={loading}>
            {#if loading}
              กำลังตรวจสอบ…
            {:else}
              <Unlock size={16} />
              ปลดล็อก Edit Mode
            {/if}
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
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 420px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .modal-body {
    padding: 20px;
  }

  .error-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .input-field {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .input-field:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-cancel {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-cancel:hover {
    background: #e2e8f0;
  }

  .btn-submit {
    background: #2563eb;
    color: #ffffff;
    border: none;
    padding: 9px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s;
  }
  .btn-submit:hover {
    background: #1d4ed8;
  }
  .btn-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
