<script lang="ts">
  import { ArrowRight } from 'lucide-svelte';
  import ServiceGrid from '$lib/components/services/ServiceGrid.svelte';
</script>

<section class="section border-y border-slate-200">

  <div class="container">

    <div class="section-top">

      <div>

        <div class="eyebrow">Our services</div>

        <h2>Services by CSNIS.</h2>

        <p>บริการและโปรเจกต์ของทีม CSNIS</p>
      </div>

      <a class="text-link" href="/services/">All services
        <ArrowRight size={16} />
      </a>
    </div>

    <ServiceGrid />
  </div>
</section>
