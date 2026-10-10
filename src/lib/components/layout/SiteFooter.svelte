<script lang="ts">
  import { Network } from "lucide-svelte";
</script>

<footer class="mt-16 border-t border-slate-200 bg-white py-7">
  <div
    class="container flex flex-wrap items-center justify-between gap-6 text-xs text-muted-foreground"
  >
    <a href="/" class="flex items-center gap-3 text-slate-900">
      <Network size={22} />

      <strong class="text-xs tracking-tight"
        >CS Network and Infrastructure System
        <!-- <span class="text-blue-700">.</span> -->
      </strong>
    </a>

    <!-- <p>Network Infrastructure · Connect. Secure. Scale.</p> -->

    <span>© {new Date().getFullYear()} <a href="https://github.com/techasit5415" target="_blank" rel="noopener noreferrer" class="hover:text-slate-900 hover:underline">Techasit Vanitpattarakul</a></span>
    <nav aria-label="นโยบายและข้อกำหนด" class="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
      <a href="/privacy" class="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-slate-900">นโยบายความเป็นส่วนตัว</a>
      <a href="/terms" class="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-slate-900">ข้อกำหนดการใช้งาน</a>
    </nav>
  </div>
</footer>
