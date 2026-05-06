<script lang="ts">
  let { questionId, questionText, value, onInput } = $props<{
    questionId: string;
    questionText: string;
    value: string;
    onInput: (questionId: string, value: string) => void;
  }>();
</script>

<section class="capture-question">
  <label for={questionId}>
    <span class="question-text">{questionText}</span>
  </label>
  <textarea
    id={questionId}
    rows="5"
    placeholder="Type key points here — names, places, incidents, phrases, anything worth keeping."
    value={value}
    oninput={(event) => onInput(questionId, (event.currentTarget as HTMLTextAreaElement).value)}
  ></textarea>
</section>

<style>
  .capture-question {
    display: grid;
    gap: 0.65rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
  }

  label {
    display: block;
  }

  .question-text {
    display: block;
    color: #0f172a;
    font-weight: 700;
    line-height: 1.55;
  }

  textarea {
    width: 100%;
    min-height: 8rem;
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 0.9rem;
    padding: 0.95rem 1rem;
    font: inherit;
    line-height: 1.6;
    color: #0f172a;
    background: #fff;
    resize: vertical;
  }
</style>
