<script lang="ts">
  import type { InterviewStep } from '$lib/utils/constants';

  let { currentStep, steps } = $props<{
    currentStep: InterviewStep;
    steps: { id: InterviewStep; label: string }[];
  }>();

  const currentStepIndex = $derived(steps.findIndex((item: { id: InterviewStep; label: string }) => item.id === currentStep));
</script>

<ol class="stepper" aria-label="Interview steps">
  {#each steps as step, index}
    <li class:active={step.id === currentStep} class:complete={currentStepIndex > index}>
      <span class="number">{index + 1}</span>
      <span class="label">{step.label}</span>
    </li>
  {/each}
</ol>

<style>
  .stepper {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
    padding: 0;
    margin: 0 0 1.5rem;
    list-style: none;
  }

  li {
    min-width: 0;
    padding: 0.85rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.8);
    color: #475569;
  }

  .number {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: #166534;
  }

  .label {
    display: block;
    margin-top: 0.25rem;
    font-weight: 600;
  }

  .active {
    border-color: #166534;
    box-shadow: 0 0 0 1px #166534 inset;
    color: #0f172a;
  }

  .complete {
    background: rgba(220, 252, 231, 0.55);
  }

  @media (max-width: 700px) {
    .stepper {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
