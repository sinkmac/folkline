<script lang="ts">
  import { browser } from '$app/environment';
  import ConductView from '$lib/components/interview/ConductView.svelte';
  import CaptureProgress from '$lib/components/interview/CaptureProgress.svelte';
  import CaptureQuestionField from '$lib/components/interview/CaptureQuestionField.svelte';
  import ErrorBanner from '$lib/components/interview/ErrorBanner.svelte';
  import PrepareForm from '$lib/components/interview/PrepareForm.svelte';
  import ReceiveSummary from '$lib/components/interview/ReceiveSummary.svelte';
  import ResetSessionModal from '$lib/components/interview/ResetSessionModal.svelte';
  import SaveStatus from '$lib/components/interview/SaveStatus.svelte';
  import Stepper from '$lib/components/interview/Stepper.svelte';
  import { clearSession, loadSession, saveSession, safeStorageAvailable } from '$lib/utils/local-storage';
  import {
    countAnsweredQuestions,
    countTotalQuestions,
    createEmptySession,
    hasAnyCapturedNotes,
    touchSession,
    type InterviewSession
  } from '$lib/utils/session';
  import { buildSummaryDocument } from '$lib/utils/summary-builder';
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
  let autosaveTimer = $state<ReturnType<typeof setTimeout> | null>(null);
  let emailLoading = $state(false);
  let emailSuccess = $state('');
  let emailError = $state('');
  const summary = $derived(buildSummaryDocument(session));
  const summaryHasContent = $derived(summary.sections.length > 0 || Boolean(summary.freeNotes?.trim()));

  const persistSession = () => {
    if (!browser || !hydrationComplete) {
      return;
    }

    saveSession(session);
  };

  const scheduleAutosave = () => {
    if (!browser) {
      return;
    }

    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
    }

    autosaveTimer = setTimeout(() => {
      session = touchSession({
        ...session,
        capture: {
          ...session.capture,
          lastSavedAt: new Date().toISOString()
        }
      });
      persistSession();
    }, 500);
  };

  const updateQuestionNote = (questionId: string, value: string) => {
    session = {
      ...session,
      capture: {
        ...session.capture,
        notesByQuestionId: {
          ...session.capture.notesByQuestionId,
          [questionId]: value
        }
      }
    };
    scheduleAutosave();
  };

  const updateFreeNotes = (value: string) => {
    session = {
      ...session,
      capture: {
        ...session.capture,
        freeNotes: value
      }
    };
    scheduleAutosave();
  };

  const sendEmail = async (email: string) => {
    emailLoading = true;
    emailSuccess = '';
    emailError = '';

    try {
      const response = await fetch('/api/send-summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, summary, honeypot: '' })
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload?.error?.message || 'Email send failed.');
      }

      emailSuccess = `Summary sent to ${email}.`;
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Email send failed.';
    } finally {
      emailLoading = false;
    }
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
    {#if session.guide}
      <p>Use this space for key points, names, places, incidents, phrases, and anything worth keeping. This is for notes, not a word-for-word transcript.</p>
      <CaptureProgress
        totalQuestions={countTotalQuestions(session)}
        answeredQuestions={countAnsweredQuestions(session)}
      />
      <SaveStatus lastSavedAt={session.capture.lastSavedAt} {storageReady} />
      <div class="capture-stack">
        {#each session.guide.sections as section}
          <section class="capture-section">
            <div class="capture-heading">
              <p class="capture-kicker">{section.title}</p>
              <h3>{section.intro}</h3>
            </div>
            <div class="capture-fields">
              {#each section.questions as question}
                <CaptureQuestionField
                  questionId={question.id}
                  questionText={question.text}
                  value={session.capture.notesByQuestionId[question.id] ?? ''}
                  onInput={updateQuestionNote}
                />
              {/each}
            </div>
          </section>
        {/each}

        <section class="capture-section">
          <div class="capture-heading">
            <p class="capture-kicker">Anything else</p>
            <h3>Free notes</h3>
          </div>
          <textarea
            class="free-notes"
            rows="8"
            placeholder="Add anything that did not fit the questions — names, family disputes, directions, objects, stories you want to keep separately."
            value={session.capture.freeNotes}
            oninput={(event) => updateFreeNotes((event.currentTarget as HTMLTextAreaElement).value)}
          ></textarea>
        </section>
      </div>
    {:else}
      <p>No guide generated yet. Go back and prepare the interview first.</p>
    {/if}
    <div class="actions">
      <button type="button" class="secondary" onclick={() => setStep('conduct')}>Back</button>
      <button type="button" class="primary" onclick={() => setStep('receive')} disabled={!session.guide}>Continue</button>
    </div>
  {:else}
    <ReceiveSummary
      summary={summary}
      hasContent={summaryHasContent}
      emailLoading={emailLoading}
      emailSuccess={emailSuccess}
      emailError={emailError}
      onSendEmail={sendEmail}
    />
    <div class="actions no-print">
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

  .capture-stack {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }

  .capture-section {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
  }

  .capture-heading {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .capture-kicker {
    margin: 0 0 0.25rem;
    color: #166534;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .capture-fields {
    display: grid;
    gap: 0.85rem;
  }

  .free-notes {
    width: 100%;
    min-height: 10rem;
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 0.9rem;
    padding: 0.95rem 1rem;
    font: inherit;
    line-height: 1.6;
    color: #0f172a;
    background: #fff;
    resize: vertical;
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

    .wizard-card {
      border: 0;
      padding: 0;
      background: transparent;
      box-shadow: none;
    }
  }
</style>
