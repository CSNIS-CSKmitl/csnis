<script lang="ts">
  import { Network } from 'lucide-svelte';
</script>

<footer class="mt-16 border-t border-slate-200 bg-white py-7">

  <div class="container flex flex-wrap items-center justify-between gap-6 text-xs text-muted-foreground">

    <a href="/" class="flex items-center gap-3 text-slate-900">

      <Network size={22} />

      <strong class="text-xl tracking-tight">CSNIS
        <span class="text-blue-700">.</span>
      </strong>
    </a>

    <p>Network Infrastructure · Connect. Secure. Scale.</p>

    <span>© {new Date().getFullYear()} CSNIS</span>
  </div>
</footer>
