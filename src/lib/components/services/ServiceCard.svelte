<script lang="ts">
  import { CalendarDays, Github, Printer, Terminal, ArrowUpRight } from 'lucide-svelte';
  import type { Service } from '$lib/data/services';
  let { service }: {
      service: Service;
  } = $props();
  const icons = { terminal: Terminal, printer: Printer, calendar: CalendarDays };
  let Icon = $derived(icons[service.icon]);
</script>

<article id={service.id} class="panel flex scroll-mt-28 flex-col p-7">

  <div class="flex items-center justify-between">

    <div class="icon-box">
      <Icon size={24} />
    </div>

    <span class="text-xs text-muted-foreground">CSNIS-CSKmitl</span>
  </div>

  <h3 class="mt-6 text-xl">{service.name}</h3>

  <p class="mt-3 mb-7 text-sm text-muted-foreground">
    ดูรายละเอียดและเอกสารของโปรเจกต์บน GitHub
  </p>

  <a
    href={service.repository}
    target="_blank"
    rel="noopener noreferrer"
    class="text-link mt-auto"
    aria-label={`View ${service.name} on GitHub (opens in a new tab)`}
  >

    <Github size={16} />
    View on GitHub
    <ArrowUpRight size={15} />
  </a>
</article>
