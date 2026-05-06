<script lang="ts">
  import type { InterviewGuide } from '$lib/schemas/guide-output';

  let { guide } = $props<{ guide: InterviewGuide }>();
</script>

<section class="briefing-card">
  <h3>Briefing note</h3>
  <p>{guide.briefingNote}</p>

  <div class="stack">
    <div>
      <h4>Opening lines</h4>
      <ul>
        {#each guide.openingLines as line}
          <li>{line}</li>
        {/each}
      </ul>
    </div>

    <div>
      <h4>Sensitivity notes</h4>
      <ul>
        {#each guide.sensitivityNotes as note}
          <li>{note}</li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<style>
  .briefing-card {
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
  }

  h3,
  h4 {
    margin-top: 0;
  }

  p,
  li {
    color: #334155;
    line-height: 1.6;
  }

  ul {
    padding-left: 1.1rem;
    margin-bottom: 0;
  }

  .stack {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }

  @media (min-width: 760px) {
    .stack {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
