// Guard DOM access so this script is safe to include on pages without these elements
(() => {
  const modal = document.getElementById('sampleModal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalContent = document.getElementById('modalContent');

  const viewButton = document.getElementById('viewButton');
  const actionSuccess = document.querySelector('.action-success');

  if (viewButton && modal && modalContent) {
    viewButton.addEventListener('click', () => {
      modalContent.textContent = 'Sample view data: John Doe, 123 Main St, Age 30.';
      modal.classList.remove('hidden');
    });
  }

  if (actionSuccess && modal && modalContent) {
    actionSuccess.addEventListener('click', () => {
      modalContent.textContent = 'Sample edit data: John Doe - You can edit this content.';
      modal.classList.remove('hidden');
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (modal) {
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }
})();




