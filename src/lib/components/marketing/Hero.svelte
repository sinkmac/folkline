<script lang="ts">
  import { APP_SUBHEAD, APP_TAGLINE } from '$lib/utils/constants';
</script>

<section class="hero">
  <p class="eyebrow">Folkline interview kit</p>
  <h1>{APP_TAGLINE}</h1>
  <p class="subhead">{APP_SUBHEAD}</p>
  <a class="cta" href="/interview">Start the interview kit</a>
</section>

<style>
  .hero {
    padding: 3rem 0 2rem;
    max-width: 44rem;
  }

  .eyebrow {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: #166534;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.5rem, 7vw, 4.5rem);
    line-height: 0.98;
    letter-spacing: -0.04em;
  }

  .subhead {
    margin: 1.25rem 0 0;
    font-size: clamp(1.15rem, 2.6vw, 1.4rem);
    line-height: 1.5;
    color: #334155;
  }

  .cta {
    display: inline-flex;
    margin-top: 1.75rem;
    padding: 0.95rem 1.35rem;
    border-radius: 999px;
    background: #14532d;
    color: #f8fafc;
    text-decoration: none;
    font-weight: 700;
  }

  .cta:hover {
    background: #166534;
  }
</style>
