// Catalog quantity steppers + request cart. No frameworks: selections are
// kept in a plain Map in memory and serialized into a hidden field right
// before the request form is submitted.

const cart = new Map(); // itemId -> { name, qty }

const cartBar = document.getElementById('cart-bar');
const cartSummary = document.getElementById('cart-summary');
const cartOpenBtn = document.getElementById('cart-open-btn');
const dialog = document.getElementById('request-dialog');
const dialogCloseBtn = document.getElementById('dialog-close-btn');
const dialogCartList = document.getElementById('dialog-cart-list');
const itemsJsonField = document.getElementById('itemsJsonField');
const requestForm = document.getElementById('request-form');

function updateCartBar() {
  const totalQty = Array.from(cart.values()).reduce((sum, entry) => sum + entry.qty, 0);
  if (totalQty === 0) {
    cartBar.hidden = true;
    return;
  }
  cartBar.hidden = false;
  const itemCount = cart.size;
  const subtotal = Array.from(cart.values()).reduce((sum, entry) => sum + entry.price * entry.qty, 0);
  cartSummary.textContent = `${totalQty} item${totalQty === 1 ? '' : 's'} selected (${itemCount} type${itemCount === 1 ? '' : 's'}) - subtotal $${subtotal.toFixed(2)}`;
}

function setQty(card, qty) {
  const id = card.dataset.itemId;
  const name = card.dataset.itemName;
  const stepper = card.querySelector('.qty-stepper');
  const max = Number(stepper.dataset.max);
  const price = Number(stepper.dataset.price);
  const clamped = Math.max(0, Math.min(max, qty));
  card.querySelector('.qty-input').value = clamped;

  if (clamped === 0) {
    cart.delete(id);
  } else {
    cart.set(id, { name, qty: clamped, price });
  }
  updateCartBar();
}

document.querySelectorAll('.catalog-card').forEach((card) => {
  const stepper = card.querySelector('.qty-stepper');
  if (!stepper) return;
  const input = stepper.querySelector('.qty-input');
  const minusBtn = stepper.querySelector('.qty-minus');
  const plusBtn = stepper.querySelector('.qty-plus');

  minusBtn.addEventListener('click', () => setQty(card, Number(input.value) - 1));
  plusBtn.addEventListener('click', () => setQty(card, Number(input.value) + 1));
  input.addEventListener('change', () => setQty(card, Number(input.value) || 0));
});

if (cartOpenBtn) {
  cartOpenBtn.addEventListener('click', () => {
    dialogCartList.innerHTML =
      '<ul>' +
      Array.from(cart.values())
        .map((entry) => `<li>${entry.name} &times; ${entry.qty}</li>`)
        .join('') +
      '</ul>';
    dialog.showModal();
  });
}

if (dialogCloseBtn) {
  dialogCloseBtn.addEventListener('click', () => dialog.close());
}

if (requestForm) {
  requestForm.addEventListener('submit', () => {
    const items = Array.from(cart.entries()).map(([id, entry]) => ({ id, qty: entry.qty }));
    itemsJsonField.value = JSON.stringify(items);
  });
}
