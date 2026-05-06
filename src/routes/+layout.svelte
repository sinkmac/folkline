<script lang="ts">
  import { env } from '$env/dynamic/public';
  import favicon from '$lib/assets/favicon.svg';
  import SiteShell from '$lib/components/layout/SiteShell.svelte';
  import { analyticsScript } from '$lib/utils/analytics';

  let { children } = $props();
  const plausibleTag = analyticsScript(env.PUBLIC_PLAUSIBLE_DOMAIN ?? '', env.PUBLIC_PLAUSIBLE_SRC || undefined);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  {@html plausibleTag}
</svelte:head>

<SiteShell>
  {@render children()}
</SiteShell>
