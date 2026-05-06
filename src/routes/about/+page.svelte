<script lang="ts">
  import { aboutCopy } from '$lib/content/site';
</script>

<svelte:head>
  <title>About | Folkline</title>
</svelte:head>

<section class="page">
  <p class="eyebrow">About Folkline</p>
  <h1>A practical tool for family memory interviews.</h1>
  <p>{aboutCopy}</p>
  <p><a href="https://stillhere.scot" rel="noreferrer">Visit Still Here</a></p>
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
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.25rem);
    line-height: 1.06;
    letter-spacing: -0.03em;
  }

  p {
    font-size: 1.08rem;
    line-height: 1.7;
    color: #334155;
  }
</style>
