<script lang="ts">
  let { loading, disabled, onSubmit } = $props<{
    loading: boolean;
    disabled: boolean;
    onSubmit: (email: string) => void;
  }>();

  let email = $state('');
  let honeypot = $state('');
</script>

<form class="email-form" onsubmit={(event) => {
  event.preventDefault();
  onSubmit(email);
}}>
  <label>
    <span>Send these notes to yourself</span>
    <input type="email" bind:value={email} placeholder="you@example.com" required disabled={disabled || loading} />
  </label>

  <input class="honeypot" tabindex="-1" autocomplete="off" bind:value={honeypot} aria-hidden="true" />

  <button type="submit" disabled={disabled || loading}>
    {#if loading}
      Sending…
    {:else}
      Send summary email
    {/if}
  </button>
</form>

<style>
  .email-form {
    display: grid;
    gap: 0.9rem;
  }

  label {
    display: grid;
    gap: 0.45rem;
  }

  span {
    font-weight: 700;
    color: #0f172a;
  }

  input {
    width: 100%;
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 0.9rem;
    padding: 0.95rem 1rem;
    font: inherit;
    background: #fff;
    color: #0f172a;
  }

  .honeypot {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 0.95rem 1.25rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    background: #14532d;
    color: #fff;
  }

  button:disabled,
  input:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
</style>
