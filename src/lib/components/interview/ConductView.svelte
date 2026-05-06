<script lang="ts">
  import type { InterviewGuide } from '$lib/schemas/guide-output';
  import BriefingCard from '$lib/components/interview/BriefingCard.svelte';
  import GuideSection from '$lib/components/interview/GuideSection.svelte';
  import { printGuide } from '$lib/utils/print';

  let { guide } = $props<{ guide: InterviewGuide }>();
</script>

<section class="conduct-view">
  <div class="screen-toolbar no-print">
    <div>
      <p class="eyebrow">Interview guide</p>
      <h2>Use this in the room, or print it and take it with you.</h2>
    </div>
    <button type="button" class="print-button" onclick={printGuide}>Print guide</button>
  </div>

  <article class="guide-sheet">
    <header class="guide-header">
      <p class="guide-kicker">Folkline interview guide</p>
      <h1>The Living Relative Interview Kit</h1>
      <p class="guide-subhead">A clean conversation guide to help you ask better questions, follow the detail that matters, and leave room for what only they can tell you.</p>
    </header>

    <BriefingCard {guide} />

    <div class="section-stack">
      {#each guide.sections as section}
        <GuideSection {section} />
      {/each}
    </div>
  </article>
</section>

<style>
  .conduct-view {
    display: grid;
    gap: 1rem;
  }

  .screen-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.82);
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    color: #166534;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.35rem, 3vw, 1.8rem);
    line-height: 1.15;
  }

  .print-button {
    border: 0;
    border-radius: 999px;
    padding: 0.9rem 1.2rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    background: #14532d;
    color: #fff;
    white-space: nowrap;
  }

  .guide-sheet {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 1.25rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fffefb;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
  }

  .guide-header {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .guide-kicker {
    margin: 0 0 0.35rem;
    color: #166534;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .guide-subhead {
    margin: 0.85rem 0 0;
    max-width: 54rem;
    color: #475569;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  .section-stack {
    display: grid;
    gap: 1rem;
  }

  @media (max-width: 760px) {
    .screen-toolbar {
      flex-direction: column;
    }

    .print-button {
      width: 100%;
    }
  }

  @media print {
    .no-print {
      display: none;
    }

    .conduct-view,
    .guide-sheet,
    .section-stack {
      gap: 0.75rem;
    }

    .guide-sheet {
      padding: 0;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      background: #fff;
    }

    .guide-header {
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #d1d5db;
      break-after: avoid;
    }

    h1 {
      font-size: 24pt;
    }

    .guide-subhead {
      font-size: 11pt;
      color: #374151;
    }
  }
</style>
