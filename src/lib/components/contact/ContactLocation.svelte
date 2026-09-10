<script lang="ts">
  import { MapPin, Network } from 'lucide-svelte';
  import { contact } from '$lib/data/contact';
</script>

<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white">

  <div class="grid md:grid-cols-[1fr_1.2fr]">

    <div class="bg-slate-900 p-8 text-white md:p-12">

      <div class="mb-7 grid size-14 place-items-center rounded-xl bg-slate-800">

        <Network size={28} />
      </div>

      <h2>CSNIS
        <br />
        Network Infrastructure</h2>

      <p class="mt-5 text-slate-300">ทีมดูแลระบบเครือข่ายและโครงสร้างพื้นฐาน</p>
    </div>

    <div class="flex flex-col justify-center p-8 md:p-12">

      <div class="eyebrow">Visit our team</div>

      <div class="mb-5 icon-box">
        <MapPin size={26} />
      </div>

      <p class="mb-3 text-sm text-muted-foreground">ติดต่อได้ที่</p>

      <h2>{contact.location}</h2>

      <p class="mt-5 text-muted-foreground">
        ติดต่อทีม {contact.team} เพื่อสอบถามเรื่องบริการและระบบเครือข่าย
      </p>
    </div>
  </div>
</section>
