<script lang="ts">
  import { ArrowUpRight, ShieldCheck, Network, Activity } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import HomeNetwork from "$lib/components/HomeNetwork.svelte";
</script>

<section class="hero">
  <div class="container hero-grid">
    <div class="hero-content">
      <div class="status-badge">
        <span class="status-dot"></span>
        <span class="status-text">CS Network Operations · Online</span>
      </div>

      <h1 class="hero-title">
        โครงสร้างพื้นฐานเครือข่าย CS KMITL
      </h1>

      <p class="hero-desc">
        ดูแลระบบโครงข่ายหลัก สวิตช์เครือข่ายความเร็วสูง เกตเวย์ไฟร์วอลล์ และการจัดสรรไอพีแอดเดรสสำหรับห้องปฏิบัติการและงานวิจัย
      </p>

      <div class="actions">
        <Button href="/services/" class="h-10 px-5 text-xs font-medium">
          สำรวจบริการเครือข่าย
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </Button>
        <Button href="/topology/" variant="outline" class="h-10 px-5 text-xs font-medium">
          <Network size={15} strokeWidth={1.5} />
          ผังโครงข่ายสด (Live Topology)
        </Button>
      </div>
    </div>

    <div class="network-preview">
      <HomeNetwork />
    </div>
  </div>
</section>

<style>
  .hero {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 56px 0 64px;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .hero-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 3px 8px;
    border-radius: 6px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    font-family: monospace;
    font-size: 11px;
    color: #475569;
  }
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #16a34a;
  }
  .hero-title {
    font-size: 2.25rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.025em;
    color: #0f172a;
    margin: 0;
  }
  .hero-desc {
    font-size: 0.875rem;
    line-height: 1.65;
    color: #475569;
    margin: 0;
    max-width: 520px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 8px;
  }
  @media (max-width: 900px) {
    .hero {
      padding: 40px 0;
    }
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }
</style>
