<script lang="ts">
  import { browser } from '$app/environment';
  import ConductView from '$lib/components/interview/ConductView.svelte';
  import ErrorBanner from '$lib/components/interview/ErrorBanner.svelte';
  import PrepareForm from '$lib/components/interview/PrepareForm.svelte';
  import ResetSessionModal from '$lib/components/interview/ResetSessionModal.svelte';
  import Stepper from '$lib/components/interview/Stepper.svelte';
  import { clearSession, loadSession, saveSession, safeStorageAvailable } from '$lib/utils/local-storage';
  import { createEmptySession, hasAnyCapturedNotes, touchSession, type InterviewSession } from '$lib/utils/session';
  import { APP_SUBHEAD, INTERVIEW_STEP_ORDER, type InterviewStep } from '$lib/utils/constants';
  import type { InterviewInput } from '$lib/schemas/interview-input';

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
  let showRegenerateWarning = $state(false);
  let pendingMetadata = $state<InterviewInput | null>(null);
  let loadingGuide = $state(false);
  let generateError = $state('');
  let generationMeta = $state<{ repaired: boolean } | null>(null);

  const persistSession = () => {
    if (!browser || !hydrationComplete) {
      return;
    }

    saveSession(session);
  };

  const setStep = (step: InterviewStep) => {
    const currentIndex = INTERVIEW_STEP_ORDER.indexOf(session.currentStep);
    const nextIndex = INTERVIEW_STEP_ORDER.indexOf(step);

    if (nextIndex > currentIndex + 1 && !session.guide) {
      return;
    }

    session = touchSession({ ...session, currentStep: step });
    persistSession();
  };

  const resetSession = () => {
    clearSession();
    session = createEmptySession();
    showResetModal = false;
    showRegenerateWarning = false;
    pendingMetadata = null;
    generateError = '';
    generationMeta = null;
    persistSession();
  };

  const runGeneration = async (metadata: InterviewInput) => {
    loadingGuide = true;
    generateError = '';

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(metadata)
      });

      const payload = await response.json();

      if (!response.ok || !payload.guide) {
        throw new Error(payload?.error?.message || 'Question generation failed.');
      }

      session = touchSession({
        ...session,
        metadata,
        guide: payload.guide,
        currentStep: 'conduct',
        capture: {
          notesByQuestionId: {},
          freeNotes: '',
          lastSavedAt: undefined
        }
      });
      generationMeta = { repaired: Boolean(payload.repaired) };
      pendingMetadata = null;
      showRegenerateWarning = false;
      persistSession();
    } catch (error) {
      generateError = error instanceof Error ? error.message : 'Question generation failed.';
    } finally {
      loadingGuide = false;
    }
  };

  const submitPrepare = async (metadata: InterviewInput) => {
    pendingMetadata = metadata;

    if (session.guide && hasAnyCapturedNotes(session)) {
      showRegenerateWarning = true;
      return;
    }

    await runGeneration(metadata);
  };

  const confirmRegenerate = async () => {
    if (!pendingMetadata) {
      showRegenerateWarning = false;
      return;
    }

    await runGeneration(pendingMetadata);
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

{#if generateError}
  <ErrorBanner message={generateError} />
{/if}

<section class="wizard-card">
  {#if session.currentStep === 'prepare'}
    <h2>Prepare</h2>
    <p>Tell Folkline who you are interviewing and what kind of memories you want help unlocking.</p>
    <PrepareForm
      metadata={session.metadata}
      loading={loadingGuide}
      canRegenerate={Boolean(session.guide)}
      onSubmit={submitPrepare}
    />
  {:else if session.currentStep === 'conduct'}
    {#if session.guide}
      {#if generationMeta?.repaired}
        <p class="status-note">This guide passed through one repair check before it was accepted.</p>
      {/if}
      <ConductView guide={session.guide} />
    {:else}
      <h2>Conduct</h2>
      <p>No guide generated yet. Go back and prepare the interview first.</p>
    {/if}
    <div class="actions no-print">
      <button type="button" class="secondary" onclick={() => setStep('prepare')}>Back</button>
      <button type="button" class="primary" onclick={() => setStep('capture')} disabled={!session.guide}>Continue</button>
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
    <p>The final summary and send-to-self delivery are held for later phases. Phase 2 keeps the completion surface intact.</p>
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

{#if showRegenerateWarning}
  <div class="backdrop" role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="regenerate-title">
      <h2 id="regenerate-title">Replace this question set?</h2>
      <p>If you generate a new guide now, any notes tied to the current question set will be cleared.</p>
      <div class="actions">
        <button type="button" class="secondary" onclick={() => (showRegenerateWarning = false)}>Keep current guide</button>
        <button type="button" class="primary" onclick={confirmRegenerate} disabled={loadingGuide}>Replace guide</button>
      </div>
    </div>
  </div>
{/if}

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
  .notice > p,
  .status-note {
    color: #475569;
    line-height: 1.6;
  }

  .status-note {
    margin-top: 0;
  }

  .paper-shell {
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    padding: 1rem;
    background: #fff;
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

  button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.45);
  }

  .modal {
    width: min(100%, 32rem);
    padding: 1.5rem;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
  }

  .modal p {
    color: #475569;
    line-height: 1.55;
  }

  @media (min-width: 760px) {
    .wizard-card,
    .notice {
      padding: 1.5rem;
    }
  }

  @media print {
    .intro .eyebrow,
    .actions,
    .notice,
    button,
    .backdrop {
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
