// Delete popup elements
const deleteModal = document.getElementById('deleteModal');
const deleteText = document.getElementById('deleteText');

// Open the popup and wait for the answer (true = delete, false = cancel)
function askDelete(text) {
  deleteText.textContent = text;
  deleteModal.returnValue = '';
  deleteModal.showModal();

  return new Promise(resolve => {
    deleteModal.onclose = () => resolve(deleteModal.returnValue === 'yes');
  });
}