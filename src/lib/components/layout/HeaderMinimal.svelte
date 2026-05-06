<script lang="ts">
  import { APP_NAME } from '$lib/utils/constants';
</script>

<header class="site-header">
  <a class="brand" href="/">{APP_NAME}</a>
  <nav aria-label="Primary">
    <a href="/about">About</a>
    <a href="/privacy">Privacy</a>
  </nav>
</header>

<style>
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 0 1.5rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .brand {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #0f172a;
    text-decoration: none;
  }

  nav {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  nav a {
    color: #334155;
    text-decoration: none;
    font-size: 0.95rem;
  }

  nav a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .site-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media print {
    .site-header {
      display: none;
    }
  }
</style>
