<script lang="ts">
  import type { SummaryDocument } from '$lib/schemas/summary';
  import { printGuide } from '$lib/utils/print';

  let { summary, hasContent } = $props<{ summary: SummaryDocument; hasContent: boolean }>();
</script>

<section class="receive-view">
  <div class="toolbar no-print">
    <div>
      <p class="eyebrow">Receive</p>
      <h2>Your interview notes, shaped into a readable document.</h2>
    </div>
    <button type="button" class="print-button" onclick={printGuide}>Print / save as PDF</button>
  </div>

  <article class="summary-sheet">
    <header class="summary-header">
      <p class="summary-kicker">Folkline summary</p>
      <h1>{summary.title}</h1>
      <p class="summary-meta">Recorded {summary.interviewDate}</p>
    </header>

    <section class="meta-grid">
      <div><strong>Interviewed</strong><span>{summary.intervieweeName || 'Not set'}</span></div>
      <div><strong>Conducted by</strong><span>{summary.interviewerName || 'Not set'}</span></div>
      <div><strong>Relationship</strong><span>{summary.relationship || 'Not set'}</span></div>
      <div><strong>Origin</strong><span>{summary.origin || 'Not set'}</span></div>
      <div><strong>Early life era</strong><span>{summary.earlyLifeEra || 'Not set'}</span></div>
      <div><strong>Themes covered</strong><span>{summary.themesCovered.length ? summary.themesCovered.join(', ') : 'None yet'}</span></div>
    </section>

    {#if hasContent}
      <div class="summary-sections">
        {#each summary.sections as section}
          <section class="summary-section">
            <h3>{section.title}</h3>
            <ul>
              {#each section.body as item}
                <li>{item}</li>
              {/each}
            </ul>
          </section>
        {/each}

        {#if summary.freeNotes}
          <section class="summary-section">
            <h3>Anything else</h3>
            <p>{summary.freeNotes}</p>
          </section>
        {/if}
      </div>
    {:else}
      <section class="empty-state">
        <h3>No notes captured yet</h3>
        <p>You can still return to Capture and add key points. The final summary will appear here once you have something worth keeping.</p>
      </section>
    {/if}
  </article>
</section>

<style>
  .receive-view {
    display: grid;
    gap: 1rem;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.84);
  }

  .eyebrow,
  .summary-kicker {
    margin: 0 0 0.35rem;
    color: #166534;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h1,
  h2,
  h3 {
    margin: 0;
  }

  h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  h2 {
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

  .summary-sheet {
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 1.25rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fffefb;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
  }

  .summary-header {
    padding-bottom: 0.85rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .summary-meta {
    margin: 0.8rem 0 0;
    color: #475569;
  }

  .meta-grid {
    display: grid;
    gap: 0.85rem;
  }

  .meta-grid div {
    display: grid;
    gap: 0.2rem;
    padding: 0.85rem 0.95rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
  }

  .meta-grid span,
  .summary-section li,
  .summary-section p,
  .empty-state p {
    color: #334155;
    line-height: 1.7;
  }

  .summary-sections {
    display: grid;
    gap: 1rem;
  }

  .summary-section {
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
    break-inside: avoid;
  }

  .summary-section ul {
    margin: 0.75rem 0 0;
    padding-left: 1.2rem;
  }

  .summary-section p {
    margin: 0.75rem 0 0;
  }

  .empty-state {
    padding: 1rem;
    border-radius: 1rem;
    border: 1px dashed rgba(15, 23, 42, 0.16);
    background: #fff;
  }

  @media (min-width: 820px) {
    .meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .toolbar {
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

    .summary-sheet {
      padding: 0;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      background: #fff;
    }

    .meta-grid div,
    .summary-section,
    .empty-state {
      border-color: #d1d5db;
      background: transparent;
    }
  }
</style>
