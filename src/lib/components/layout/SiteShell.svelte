<script lang="ts">
  import HeaderMinimal from '$lib/components/layout/HeaderMinimal.svelte';
  import FooterMinimal from '$lib/components/layout/FooterMinimal.svelte';

  let { children } = $props();
</script>

<div class="shell">
  <HeaderMinimal />
  <main>
    {@render children()}
  </main>
  <FooterMinimal />
</div>

<style>
  :global(body) {
    margin: 0;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    color: #0f172a;
    background: #fcfaf6;
  }

  :global(a) {
    color: #14532d;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(.print-only) {
    display: none;
  }

  .shell {
    width: min(100%, 72rem);
    margin: 0 auto;
    padding: 0 1rem 3rem;
  }

  main {
    padding-top: 1.25rem;
  }

  @media (min-width: 768px) {
    .shell {
      padding: 0 1.5rem 4rem;
    }
  }

  @media print {
    :global(body) {
      background: #ffffff;
      color: #111827;
      font-size: 12pt;
    }

    :global(.print-only) {
      display: block;
    }

    .shell {
      width: 100%;
      max-width: none;
      padding: 0;
      margin: 0;
    }

    main {
      padding: 0;
    }
  }
</style>
