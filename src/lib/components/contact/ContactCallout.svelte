<script lang="ts">
  import { ArrowRight, MapPin } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { contact } from '$lib/data/contact';
</script>

<div class="navy-callout">

  <div>

    <div class="eyebrow" style="color: #93c5fd">Contact CSNIS</div>

    <h2>Let’s keep your team connected.</h2>

    <p class="flex items-center gap-2">

      <MapPin size={18} />
      ติดต่อได้ที่ {contact.location}
    </p>
  </div>

  <Button href="/contact/" class="h-12 bg-white px-5 text-slate-900 hover:bg-slate-100">
    Contact the team
    <ArrowRight size={16} />
  </Button>
</div>
