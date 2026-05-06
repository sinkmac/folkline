export const analyticsScript = (domain: string, src = 'https://plausible.io/js/script.js') => {
  if (!domain) {
    return '';
  }

  return `<script defer data-domain="${domain}" src="${src}"></script>`;
};
