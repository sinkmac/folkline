<script lang="ts">
  let { message } = $props<{ message: string }>();
</script>

<section class="error-banner" role="alert">
  <strong>Something went wrong.</strong>
  <p>{message}</p>
</section>

<style>
  .error-banner {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(153, 27, 27, 0.18);
    background: #fef2f2;
    color: #7f1d1d;
  }

  p {
    margin: 0.4rem 0 0;
    line-height: 1.5;
  }
</style>
