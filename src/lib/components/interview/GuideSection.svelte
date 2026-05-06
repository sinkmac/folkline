<script lang="ts">
  import type { GuideSection } from '$lib/schemas/guide-output';

  let { section } = $props<{ section: GuideSection }>();
</script>

<section class="guide-section">
  <h3>{section.title}</h3>
  <p class="intro">{section.intro}</p>

  <ol>
    {#each section.questions as question}
      <li>{question.text}</li>
    {/each}
  </ol>

  <div class="followups">
    <h4>If they mention something interesting, you could ask…</h4>
    <ul>
      {#each section.followUps as prompt}
        <li>{prompt}</li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .guide-section {
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
  }

  h3,
  h4 {
    margin-top: 0;
  }

  .intro,
  li {
    color: #334155;
    line-height: 1.7;
  }

  ol,
  ul {
    padding-left: 1.25rem;
    margin-bottom: 0;
  }

  .followups {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }
</style>
