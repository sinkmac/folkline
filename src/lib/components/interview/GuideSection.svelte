<script lang="ts">
  import type { GuideSection } from '$lib/schemas/guide-output';

  let { section } = $props<{ section: GuideSection }>();
</script>

<section class="guide-section">
  <div class="section-heading">
    <p class="section-kicker">{section.title}</p>
    <h3>{section.intro}</h3>
  </div>

  <div class="columns">
    <div class="question-block">
      <h4>Questions</h4>
      <ol>
        {#each section.questions as question}
          <li>{question.text}</li>
        {/each}
      </ol>
    </div>

    <div class="followup-block">
      <h4>If something opens up</h4>
      <ul>
        {#each section.followUps as prompt}
          <li>{prompt}</li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<style>
  .guide-section {
    display: grid;
    gap: 1rem;
    padding: 1.1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
    break-inside: avoid;
  }

  .section-heading {
    padding-bottom: 0.85rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .section-kicker {
    margin: 0 0 0.3rem;
    color: #166534;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h3,
  h4 {
    margin: 0;
  }

  h3 {
    font-size: 1.15rem;
    line-height: 1.45;
  }

  .columns {
    display: grid;
    gap: 1rem;
  }

  .question-block,
  .followup-block {
    display: grid;
    gap: 0.5rem;
  }

  li {
    color: #334155;
    line-height: 1.75;
  }

  ol,
  ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  @media (min-width: 880px) {
    .columns {
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
      align-items: start;
    }
  }

  @media print {
    .guide-section {
      padding: 0.8rem 0 0.3rem;
      border: 0;
      border-bottom: 1px solid #e5e7eb;
      border-radius: 0;
      background: transparent;
    }

    .section-heading {
      border-bottom: 0;
      padding-bottom: 0.3rem;
    }
  }
</style>
