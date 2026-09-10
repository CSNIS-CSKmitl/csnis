<script lang="ts">
  import { page } from "$app/state";
  import { afterNavigate } from "$app/navigation";
  import { Network, Menu, X, ArrowUpRight } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  let menuOpen = $state(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/services/", label: "Services" },
    { href: "/infrastructure/", label: "Infrastructure" },
    { href: "/topology/", label: "Live Topology" },
    { href: "/contact/", label: "Contact" },
  ];
  afterNavigate(() => {
    menuOpen = false;
  });
</script>

<a class="skip-link" href="#main">Skip to content</a>

<header>
  <div class="container nav-inner">
    <a href="/" class="brand" aria-label="CSNIS Home">
      <span class="brand-icon">
        <Network size={24} />
      </span>

      <span>
        <strong
          >CSNIS
          <span class="brand-dot">.</span>
        </strong>

        <small>Network Infrastructure</small>
      </span>
    </a>

    <nav class:open={menuOpen} id="main-nav" aria-label="Main navigation">
      {#each links as link (link.href)}
        <a
          href={link.href}
          aria-current={page.url.pathname === link.href ? "page" : undefined}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <Button
      variant="ghost"
      class="mobile-menu"
      aria-label={menuOpen ? "Close navigation" : "Open navigation"}
      aria-expanded={menuOpen}
      aria-controls="main-nav"
      onclick={() => (menuOpen = !menuOpen)}
    >
      {#if menuOpen}
        <X />
      {:else}
        <Menu />
      {/if}
    </Button>
  </div>
</header>

<style>
  header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 30;
  }
  .nav-inner {
    min-height: 86px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    flex-shrink: 0;
  }
  .brand-icon {
    color: white;
    background: #1d4ed8;
    width: 43px;
    height: 43px;
    border-radius: 11px;
    display: grid;
    place-items: center;
  }
  .brand strong {
    font-size: 1.3rem;
    letter-spacing: -0.04em;
  }
  .brand-dot {
    color: #1d4ed8;
  }
  .brand small {
    display: block;
    font-size: 0.7rem;
    color: #64748b;
    line-height: 1.5;
  }
  nav {
    display: flex;
    align-items: center;
    gap: 26px;
  }
  nav a {
    font-size: 0.875rem;
    color: #64748b;
    padding-block: 31px;
    border-bottom: 2px solid transparent;
  }
  nav a:hover,
  nav a[aria-current] {
    color: #1d4ed8;
  }
  nav a[aria-current] {
    border-bottom-color: #1d4ed8;
  }
  :global(.mobile-menu) {
    display: none;
  }
  .skip-link {
    position: fixed;
    top: -100px;
    left: 20px;
    z-index: 100;
    padding: 12px;
    background: white;
  }
  .skip-link:focus {
    top: 12px;
  }
  @media (max-width: 1050px) {
    nav {
      gap: 17px;
    }
    .support {
      display: none;
    }
  }
  @media (max-width: 760px) {
    .nav-inner {
      min-height: 74px;
    }
    :global(.mobile-menu) {
      display: inline-flex;
    }
    nav {
      display: none;
      position: absolute;
      top: 74px;
      left: 0;
      right: 0;
      background: white;
      padding: 16px 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    nav.open {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
    }
    nav a {
      padding: 12px;
      border: 0;
    }
    nav a[aria-current] {
      background: #eff6ff;
      border-radius: 8px;
    }
  }
</style>
