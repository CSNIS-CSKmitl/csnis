<script lang="ts">
  import { Network, ShieldCheck, Globe, Wifi, Server, ArrowUpRight } from 'lucide-svelte';
</script>

<div class="network panel">

  <div class="heading">
    <span>
      <Network size={16}/>
      Our connected infrastructure</span>
    <span class="sample">ILLUSTRATIVE</span>
  </div>

  <div class="diagram">

    <svg viewBox="0 0 500 340" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="home-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e8edf4" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="500" height="340" fill="url(#home-grid)"/>
      <path d="M110 80 H250 V170 M390 80 H250 M110 260 H250 V170 M390 260 H250" fill="none" stroke="#a9bce0" stroke-width="1.5"/>
    </svg>

    <div class="node wan">
      <Globe size={24}/>
      <span>WAN Router</span>
    </div>
    <div class="node firewall">
      <ShieldCheck size={24}/>
      <span>Firewall</span>
    </div>
    <div class="node core">
      <Network size={34}/>
      <span>Core Switch</span>
    </div>
    <div class="node wireless">
      <Wifi size={24}/>
      <span>Wireless LAN</span>
    </div>
    <div class="node server">
      <Server size={24}/>
      <span>Server Network</span>
    </div>
  </div>

  <a href="/topology/" class="network-bottom">
    <span>Explore the network topology</span>
    <ArrowUpRight size={18}/>
  </a>
</div>

<style>
  .network {
    overflow: hidden;
    box-shadow: 0 12px 32px #0f172a06;
  }
  .heading {
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: .75rem;
    font-weight: 600;
  }
  .heading>span:first-child {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sample {
    font-size: .625rem;
    letter-spacing: .1em;
    color: #64748b;
  }
  .diagram {
    height: 340px;
    position: relative;
    border-block: 1px solid #edf1f6;
  }
  svg {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .node {
    width: 106px;
    height: 76px;
    position: absolute;
    transform: translate(-50%,-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid #dbe4f0;
    background: white;
    border-radius: 12px;
    color: #475569;
  }
  .node span {
    font-size: .7rem;
    font-weight: 500;
    white-space: nowrap;
  }
  .wan {
    top: 23.53%;
    left: 22%;
  }
  .firewall {
    top: 23.53%;
    left: 78%;
  }
  .wireless {
    top: 76.47%;
    left: 22%;
  }
  .server {
    top: 76.47%;
    left: 78%;
  }
  .core {
    top: 50%;
    left: 50%;
    width: 116px;
    height: 88px;
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: white;
  }
  .network-bottom {
    display: flex;
    justify-content: space-between;
    padding: 17px 24px;
    font-size: .75rem;
    color: #1d4ed8;
    font-weight: 600;
  }
  @media(max-width:400px) {
    .heading {
      padding-inline: 14px;
    }
    .sample {
      display: none;
    }
    .node {
      width: 94px;
    }
    .core {
      width: 104px;
    }
  }
</style>
