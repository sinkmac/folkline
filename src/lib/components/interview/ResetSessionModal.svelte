<script lang="ts">
  let { open, onConfirm, onCancel } = $props<{
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }>();
</script>

{#if open}
  <div class="backdrop" role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
      <h2 id="reset-title">Reset this interview session?</h2>
      <p>This clears the current guide and any notes saved on this device for Folkline.</p>
      <div class="actions">
        <button type="button" class="secondary" onclick={onCancel}>Keep session</button>
        <button type="button" class="danger" onclick={onConfirm}>Reset session</button>
      </div>
    </div>
  </div>
{/if}

<style>
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

  h2 {
    margin: 0 0 0.75rem;
  }

  p {
    margin: 0;
    color: #475569;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 0.8rem 1.1rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .secondary {
    background: #e2e8f0;
    color: #0f172a;
  }

  .danger {
    background: #991b1b;
    color: #fff;
  }
</style>
