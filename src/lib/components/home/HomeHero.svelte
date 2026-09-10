<script lang="ts">
  import { ArrowRight, ShieldCheck, Network } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import HomeNetwork from '$lib/components/HomeNetwork.svelte';
</script>

<section class="hero">
  <div class="container hero-grid">
    <div>
      <div class="eyebrow">CSNIS / Network Infrastructure</div>
      <h1>Connect.
        <br/>
        Secure.
        <br/>
        <span>Scale.</span>
      </h1>
      <p class="hero-desc">ดูแลทุกการเชื่อมต่อ ให้ธุรกิจเดินหน้าได้อย่างมั่นใจ</p>
      <p class="muted intro">CSNIS Network Infrastructure ดูแลระบบเครือข่ายและโครงสร้างพื้นฐาน ให้รวดเร็ว เสถียร ปลอดภัย และพร้อมรองรับการเติบโตขององค์กร</p>
      <div class="actions">
        <Button href="/services/" class="h-12 px-6">Explore Services
          <ArrowRight size={16}/>
        </Button>
        <Button href="/topology/" variant="outline" class="h-12 px-6">
          <Network size={16}/>
          Live Topology</Button>
      </div>
      <div class="principles">
        <span>
          <ShieldCheck size={16}/>
          Secure by design</span>
        <span>
          <Network size={16}/>
          Built to connect</span>
      </div>
    </div>
    <HomeNetwork/>
  </div>
</section>

<style>
  .hero {
    background: white;
    padding: 64px 0 72px;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 70px;
    align-items: center;
  }
  h1 {
    font-size: clamp(3.5rem,5.9vw,5rem);
    line-height: 1.06;
    letter-spacing: -.065em;
  }
  h1 span {
    color: #1d4ed8;
  }
  .hero-desc {
    margin-top: 24px;
    font-weight: 600;
    font-size: 1.08rem;
  }
  .intro {
    margin-top: 12px;
    max-width: 490px;
    font-size: .95rem;
    line-height: 1.9;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }
  .principles {
    margin-top: 28px;
    display: flex;
    flex-wrap: wrap;
    gap: 22px;
    font-size: .75rem;
    color: #64748b;
  }
  .principles span {
    display: flex;
    gap: 7px;
    align-items: center;
  }
  @media(max-width:900px) {
    .hero-grid {
      gap: 32px;
    }
  }
  @media(max-width:760px) {
    .hero {
      padding: 40px 0;
    }
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }
</style>
