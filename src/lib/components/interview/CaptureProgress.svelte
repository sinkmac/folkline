<script lang="ts">
  let { totalQuestions, answeredQuestions } = $props<{ totalQuestions: number; answeredQuestions: number }>();

  const percentage = $derived(totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0);
</script>

<section class="capture-progress" aria-label="Capture progress">
  <div class="top-row">
    <div>
      <p class="eyebrow">Capture progress</p>
      <h3>{answeredQuestions} of {totalQuestions} questions covered</h3>
    </div>
    <strong>{percentage}%</strong>
  </div>
  <div class="track" aria-hidden="true">
    <div class="fill" style={`width:${percentage}%`}></div>
  </div>
</section>

<style>
  .capture-progress {
    display: grid;
    gap: 0.75rem;
    padding: 1rem 1.1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: end;
  }

  .eyebrow {
    margin: 0 0 0.25rem;
    color: #166534;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h3,
  strong {
    margin: 0;
  }

  h3 {
    font-size: 1.05rem;
  }

  strong {
    font-size: 1rem;
  }

  .track {
    height: 0.65rem;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #166534, #22c55e);
  }
</style>
