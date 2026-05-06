<script lang="ts">
  import { browser } from '$app/environment';
  import ResetSessionModal from '$lib/components/interview/ResetSessionModal.svelte';
  import Stepper from '$lib/components/interview/Stepper.svelte';
  import { clearSession, loadSession, saveSession, safeStorageAvailable } from '$lib/utils/local-storage';
  import { createEmptySession, hasAnyCapturedNotes, touchSession, type InterviewSession } from '$lib/utils/session';
  import { APP_SUBHEAD, INTERVIEW_STEP_ORDER, type InterviewStep } from '$lib/utils/constants';

  const steps: { id: InterviewStep; label: string }[] = [
    { id: 'prepare', label: 'Prepare' },
    { id: 'conduct', label: 'Conduct' },
    { id: 'capture', label: 'Capture' },
    { id: 'receive', label: 'Receive' }
  ];

  let session = $state<InterviewSession>(createEmptySession());
  let hydrationComplete = $state(false);
  let storageReady = $state(false);
  let showResetModal = $state(false);

  const setStep = (step: InterviewStep) => {
    const currentIndex = INTERVIEW_STEP_ORDER.indexOf(session.currentStep);
    const nextIndex = INTERVIEW_STEP_ORDER.indexOf(step);

    if (nextIndex > currentIndex + 1) {
      return;
    }

    session = touchSession({ ...session, currentStep: step });
    persistSession();
  };

  const persistSession = () => {
    if (!browser || !hydrationComplete) {
      return;
    }

    saveSession(session);
  };

  const resetSession = () => {
    clearSession();
    session = createEmptySession();
    showResetModal = false;
    persistSession();
  };

  if (browser) {
    storageReady = safeStorageAvailable();
    session = loadSession();
    hydrationComplete = true;
  }

  $effect(() => {
    if (!hydrationComplete) {
      return;
    }

    persistSession();
  });
</script>

<section class="intro">
  <p class="eyebrow">Interview tool</p>
  <h1>Prepare, conduct, capture, and keep an interview in one place.</h1>
  <p>{APP_SUBHEAD}</p>
</section>

<Stepper currentStep={session.currentStep} {steps} />

{#if !storageReady}
  <section class="notice warning">
    <h2>Local storage is unavailable on this device.</h2>
    <p>You can still explore the tool shell, but progress will not survive refresh until browser storage is available.</p>
  </section>
{/if}

<section class="wizard-card">
  {#if session.currentStep === 'prepare'}
    <h2>Prepare</h2>
    <p>Phase 1 shell is ready. The question generator is the next phase.</p>
    <div class="placeholder-grid">
      <div>
        <strong>Will collect</strong>
        <ul>
          <li>Who you are interviewing</li>
          <li>Origin and era</li>
          <li>Known context</li>
          <li>Themes you want to explore</li>
        </ul>
      </div>
      <div>
        <strong>Session status</strong>
        <ul>
          <li>Guide generated: No</li>
          <li>Notes captured: {hasAnyCapturedNotes(session) ? 'Yes' : 'No'}</li>
          <li>Saved locally: {storageReady ? 'Yes' : 'No'}</li>
        </ul>
      </div>
    </div>
    <button type="button" class="primary" onclick={() => setStep('conduct')}>Preview next step shell</button>
  {:else if session.currentStep === 'conduct'}
    <h2>Conduct</h2>
    <p>This view will become the large-type interview guide. In Phase 1 it defines the screen and print-safe shell.</p>
    <div class="paper-shell">
      <p class="print-only">Folkline interview guide</p>
      <p><strong>Briefing note placeholder:</strong> Open gently, let silence sit, and leave room for objects, places, and names.</p>
      <p><strong>Guide placeholder:</strong> Questions and follow-up prompts will render here in Phase 2.</p>
    </div>
    <div class="actions">
      <button type="button" class="secondary" onclick={() => setStep('prepare')}>Back</button>
      <button type="button" class="primary" onclick={() => setStep('capture')}>Continue</button>
    </div>
  {:else if session.currentStep === 'capture'}
    <h2>Capture</h2>
    <p>The capture form arrives in Phase 4. This shell preserves the step boundary and local-save expectations.</p>
    <div class="paper-shell">
      <p><strong>Autosave target:</strong> localStorage</p>
      <p><strong>Progress indicator:</strong> ready for Phase 4 wiring</p>
      <p><strong>Free notes:</strong> reserved for anything the guide did not cover</p>
    </div>
    <div class="actions">
      <button type="button" class="secondary" onclick={() => setStep('conduct')}>Back</button>
      <button type="button" class="primary" onclick={() => setStep('receive')}>Continue</button>
    </div>
  {:else}
    <h2>Receive</h2>
    <p>The final summary and send-to-self delivery are held for later phases. Phase 1 only establishes the completion surface.</p>
    <div class="paper-shell">
      <p><strong>Output law:</strong> readable document, not raw dump</p>
      <p><strong>PDF law:</strong> print-to-PDF first, attachment only when proven</p>
      <p><strong>Email law:</strong> optional one-shot convenience, not completion gate</p>
    </div>
    <div class="actions">
      <button type="button" class="secondary" onclick={() => setStep('capture')}>Back</button>
      <button type="button" class="danger" onclick={() => (showResetModal = true)}>Reset session</button>
    </div>
  {/if}
</section>

<ResetSessionModal
  open={showResetModal}
  onCancel={() => (showResetModal = false)}
  onConfirm={resetSession}
/>

<style>
  .intro {
    max-width: 48rem;
    margin-bottom: 1.75rem;
  }

  .eyebrow {
    margin: 0 0 0.75rem;
    color: #166534;
    font-size: 0.95rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.25rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .intro p:last-child {
    margin-top: 1rem;
    color: #475569;
    font-size: 1.1rem;
    line-height: 1.55;
  }

  .wizard-card,
  .notice {
    border-radius: 1.25rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.84);
    padding: 1.25rem;
  }

  .notice {
    margin-bottom: 1rem;
  }

  .warning {
    background: #fff7ed;
  }

  .wizard-card h2,
  .notice h2 {
    margin-top: 0;
  }

  .wizard-card > p,
  .notice > p {
    color: #475569;
    line-height: 1.6;
  }

  .placeholder-grid {
    display: grid;
    gap: 1rem;
    margin: 1rem 0 1.5rem;
  }

  .placeholder-grid > div,
  .paper-shell {
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    padding: 1rem;
    background: #fff;
  }

  .placeholder-grid ul {
    margin: 0.65rem 0 0;
    padding-left: 1.1rem;
    color: #475569;
    line-height: 1.6;
  }

  .paper-shell p {
    margin: 0 0 0.8rem;
    line-height: 1.6;
    color: #334155;
  }

  .paper-shell p:last-child {
    margin-bottom: 0;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 0.9rem 1.2rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .primary {
    background: #14532d;
    color: #fff;
  }

  .secondary {
    background: #e2e8f0;
    color: #0f172a;
  }

  .danger {
    background: #991b1b;
    color: #fff;
  }

  @media (min-width: 760px) {
    .placeholder-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .wizard-card,
    .notice {
      padding: 1.5rem;
    }
  }

  @media print {
    .intro .eyebrow,
    .actions,
    .notice,
    button {
      display: none;
    }

    .wizard-card,
    .paper-shell {
      border: 0;
      padding: 0;
      background: transparent;
      box-shadow: none;
    }
  }
</style>
