<script lang="ts">
  import type { InterviewInput } from '$lib/schemas/interview-input';
  import { THEME_OPTIONS } from '$lib/utils/constants';

  let { metadata, loading, canRegenerate, onSubmit } = $props<{
    metadata: InterviewInput;
    loading: boolean;
    canRegenerate: boolean;
    onSubmit: (metadata: InterviewInput) => void;
  }>();

  const cloneMetadata = (value: InterviewInput): InterviewInput => ({
    ...value,
    themes: [...value.themes]
  });

  let form = $state<InterviewInput>({
    intervieweeName: '',
    interviewerName: '',
    relationship: '',
    origin: '',
    earlyLifeEra: '',
    knownContext: '',
    themes: [],
    interviewDate: ''
  });

  $effect(() => {
    form = cloneMetadata(metadata);
  });

  const toggleTheme = (theme: (typeof THEME_OPTIONS)[number]) => {
    form = {
      ...form,
      themes: form.themes.includes(theme)
        ? form.themes.filter((item) => item !== theme)
        : [...form.themes, theme]
    };
  };

  const submit = () => {
    onSubmit(form);
  };
</script>

<form class="prepare-form" onsubmit={(event) => {
  event.preventDefault();
  submit();
}}>
  <div class="field-grid">
    <label>
      <span>Who are you interviewing?</span>
      <input bind:value={form.intervieweeName} maxlength="80" placeholder="Margaret McLay" required />
    </label>

    <label>
      <span>Your relationship to them</span>
      <input bind:value={form.relationship} maxlength="80" placeholder="Grandmother" required />
    </label>

    <label>
      <span>Your name</span>
      <input bind:value={form.interviewerName} maxlength="80" placeholder="Anna" />
    </label>

    <label>
      <span>Date of interview</span>
      <input bind:value={form.interviewDate} maxlength="40" placeholder="12 May 2026" />
    </label>

    <label class="full-width">
      <span>Where is the family from?</span>
      <input bind:value={form.origin} maxlength="120" placeholder="Lanarkshire, Scotland" required />
    </label>

    <label class="full-width">
      <span>What era shaped their early life?</span>
      <input bind:value={form.earlyLifeEra} maxlength="120" placeholder="Born in the 1930s, grew up in the 1940s–50s" required />
    </label>

    <label class="full-width">
      <span>Known facts or context</span>
      <textarea bind:value={form.knownContext} rows="5" maxlength="1200" placeholder="Worked in a mill, later moved to Glasgow, had three sisters."></textarea>
    </label>
  </div>

  <fieldset>
    <legend>Themes you want to explore</legend>
    <div class="themes">
      {#each THEME_OPTIONS as theme}
        <label class:checked={form.themes.includes(theme)}>
          <input
            type="checkbox"
            checked={form.themes.includes(theme)}
            onchange={() => toggleTheme(theme)}
          />
          <span>{theme}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  <div class="actions">
    <button type="submit" class="primary" disabled={loading}>
      {#if loading}
        Generating questions…
      {:else if canRegenerate}
        Regenerate question set
      {:else}
        Generate question set
      {/if}
    </button>
  </div>
</form>

<style>
  .prepare-form {
    display: grid;
    gap: 1.5rem;
  }

  .field-grid {
    display: grid;
    gap: 1rem;
  }

  label,
  fieldset {
    display: grid;
    gap: 0.5rem;
  }

  span,
  legend {
    font-weight: 700;
    color: #0f172a;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid rgba(15, 23, 42, 0.16);
    border-radius: 0.9rem;
    padding: 0.95rem 1rem;
    font: inherit;
    background: #fff;
    color: #0f172a;
  }

  textarea {
    resize: vertical;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  .themes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .themes label {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.75rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: #fff;
    cursor: pointer;
  }

  .themes label.checked {
    border-color: #166534;
    background: rgba(220, 252, 231, 0.55);
  }

  .themes input {
    width: auto;
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: flex-start;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 0.95rem 1.25rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button.primary {
    background: #14532d;
    color: #fff;
  }

  button:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  @media (min-width: 760px) {
    .field-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .full-width {
      grid-column: 1 / -1;
    }
  }
</style>
