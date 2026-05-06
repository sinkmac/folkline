<script lang="ts">
  import type { InterviewGuide } from '$lib/schemas/guide-output';

  let { guide } = $props<{ guide: InterviewGuide }>();
</script>

<section class="briefing-card">
  <div class="briefing-block">
    <h3>Before you begin</h3>
    <p>{guide.briefingNote}</p>
  </div>

  <div class="grid">
    <div class="briefing-block">
      <h4>Ways to open</h4>
      <ul>
        {#each guide.openingLines as line}
          <li>{line}</li>
        {/each}
      </ul>
    </div>

    <div class="briefing-block">
      <h4>Keep in mind</h4>
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
    display: grid;
    gap: 1rem;
    padding: 1.15rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
    break-inside: avoid;
  }

  .grid {
    display: grid;
    gap: 1rem;
  }

  .briefing-block h3,
  .briefing-block h4 {
    margin: 0 0 0.5rem;
  }

  .briefing-block p,
  .briefing-block li {
    color: #334155;
    line-height: 1.7;
  }

  ul {
    padding-left: 1.1rem;
    margin: 0;
  }

  @media (min-width: 760px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media print {
    .briefing-card {
      padding: 0.9rem 0 0.5rem;
      border: 0;
      border-top: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
      border-radius: 0;
      background: transparent;
    }
  }
</style>
