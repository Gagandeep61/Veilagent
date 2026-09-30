function saveChanges() {
  const banner = document.getElementById('status-banner');
  const message = document.getElementById('status-message');
  
  if (banner && message) {
    message.textContent = 'Saved successfully! Changes updated in portal record.';
    banner.classList.remove('hidden');
    
    // Add visual click indicator for agent verification
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
      saveBtn.style.outline = '3px solid #22c55e';
      setTimeout(() => {
        saveBtn.style.outline = '';
      }, 1500);
    }
  }
}

function cancelAction() {
  const banner = document.getElementById('status-banner');
  const message = document.getElementById('status-message');
  
  if (banner && message) {
    message.textContent = 'Operation cancelled. Form reset.';
    banner.classList.remove('hidden');
  }
}

window.saveChanges = saveChanges;
window.cancelAction = cancelAction;
