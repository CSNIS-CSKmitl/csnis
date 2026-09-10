<section class="section">
  <div class="section-top">
    <div>
      <div class="eyebrow">Architecture</div>
      <h2>Designed in layers.</h2>
    </div>
  </div>
  <div class="grid gap-5 md:grid-cols-3">
    {#each [['01','Network edge','WAN Router · Firewall','เชื่อมต่อภายนอกและควบคุมการรับส่งข้อมูลเข้าสู่เครือข่ายองค์กร'],['02','Core network','Core Switch','ศูนย์กลางการเชื่อมต่อและรับส่งข้อมูลระหว่างส่วนต่าง ๆ ของเครือข่าย'],['03','Access & services','Distribution · Wireless · Servers','เชื่อมต่อผู้ใช้งาน อุปกรณ์ไร้สาย และระบบบริการภายในองค์กร']] as [num,title,sub,desc]}
      <article class="panel p-7">
        <span class="font-mono text-sm text-blue-700">{num} /</span>
        <h3 class="mt-5">{title}</h3>
        <p class="mt-2 text-xs text-blue-700">{sub}</p>
        <p class="mt-4 muted">{desc}</p>
      </article>
      {/each}
  </div>
</section>
