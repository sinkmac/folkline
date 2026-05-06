<script lang="ts">
  let { lastSavedAt, storageReady } = $props<{ lastSavedAt?: string; storageReady: boolean }>();

  const formatted = $derived(
    lastSavedAt
      ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : ''
  );
</script>

<section class="save-status" aria-live="polite">
  {#if !storageReady}
    <p>Browser storage is unavailable on this device.</p>
  {:else if formatted}
    <p>Saved locally at {formatted}</p>
  {:else}
    <p>Saving locally as you type</p>
  {/if}
</section>

<style>
  .save-status {
    padding: 0.85rem 1rem;
    border-radius: 0.9rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.84);
    color: #475569;
    font-size: 0.95rem;
  }

  p {
    margin: 0;
  }
</style>
