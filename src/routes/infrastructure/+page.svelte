<script lang="ts">
  import { ArrowUpRight, Network } from 'lucide-svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import NetworkInventory from '$lib/components/infrastructure/NetworkInventory.svelte';
  import ArchitectureOverview from '$lib/components/infrastructure/ArchitectureOverview.svelte';
  import { Button } from '$lib/components/ui/button';
  import { initialDevices } from '$lib/monitoring/mock';
</script>

<svelte:head>
  <title>Infrastructure — CSNIS</title>
  <meta name="description" content="ภาพรวมโครงสร้างพื้นฐาน CSNIS: Network edge, Core, Wireless และ Server Network"/>
</svelte:head>

<div class="container">
  <PageHeader label="Infrastructure overview" title="One connected foundation." description="ภาพรวมองค์ประกอบเครือข่าย ตั้งแต่ Network Edge ไปจนถึงระบบภายในองค์กร"/>
  <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <span class="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">SAMPLE INVENTORY · ข้อมูลตัวอย่าง</span>
    <Button href="/topology/" variant="outline" class="h-10">
      <Network size={16}/>
      View Live Topology
      <ArrowUpRight size={16}/>
    </Button>
  </div>
  <div class="metric-grid">
    <div class="metric panel">
      <small>Network devices</small>
      <strong>{initialDevices.length.toString().padStart(2,'0')}</strong>
      <p>Across the sample network</p>
    </div>
    <div class="metric panel">
      <small>Network layers</small>
      <strong>03</strong>
      <p>Edge, core & access</p>
    </div>
    <div class="metric panel">
      <small>Core link capacity</small>
      <strong>10
        <span class="text-base font-medium">Gbps</span>
      </strong>
      <p>Illustrative configuration</p>
    </div>
    <div class="metric panel">
      <small>Services connected</small>
      <strong>04</strong>
      <p>WAN, security, wireless & servers</p>
    </div>
  </div>
  <NetworkInventory />

  <ArchitectureOverview />
</div>
