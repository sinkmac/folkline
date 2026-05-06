<script lang="ts">
  import { privacyBullets } from '$lib/content/site';
</script>

<svelte:head>
  <title>Privacy | Folkline</title>
</svelte:head>

<section class="page">
  <p class="eyebrow">Privacy</p>
  <h1>Clear handling, no hidden traps.</h1>
  <ul>
    {#each privacyBullets as bullet}
      <li>{bullet}</li>
    {/each}
  </ul>
  <p class="note">This policy will expand in later phases when the email delivery path is wired. Phase 1 locks the core privacy posture.</p>
</section>

<style>
  .page {
    max-width: 44rem;
  }

  .eyebrow {
    margin: 0 0 0.75rem;
    color: #166534;
    font-size: 0.95rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0 0 1rem;
    font-size: clamp(2rem, 5vw, 3.25rem);
    line-height: 1.06;
    letter-spacing: -0.03em;
  }

  ul {
    padding-left: 1.2rem;
    color: #334155;
    line-height: 1.7;
    font-size: 1.05rem;
  }

  li + li {
    margin-top: 0.65rem;
  }

  .note {
    margin-top: 1.25rem;
    color: #475569;
  }
</style>
