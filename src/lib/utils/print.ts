export const printGuide = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.print();
};
