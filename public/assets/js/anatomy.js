document.addEventListener('astro:page-load', () => {
  const callouts = document.querySelectorAll('.callout[data-target]');
  callouts.forEach(callout => {
    const target = callout.dataset.target;
    const section = document.querySelector(`[data-section="${target}"]`);
    if (!section) return;

    callout.addEventListener('mouseenter', () => {
      section.classList.add('highlighted');
    });
    callout.addEventListener('mouseleave', () => {
      section.classList.remove('highlighted');
    });
  });

  const stepTabs = document.querySelectorAll('.step-tab');
  stepTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      stepTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});
