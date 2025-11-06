// Shared data and helpers for the site.
// Defines course data, renders checkboxes, does calculations and basic form validation.

// Course dataset (keys correspond to query id used in links)
window.courseData = {
  "first-aid": {
    id: "first-aid",
    title: "First Aid",
    fee: 1500,
    purpose: "To provide first aid awareness and basic life support",
    content: ["Wounds and bleeding", "Burns and fractures", "Emergency scene management", "CPR", "Respiratory distress"]
  },
  "sewing": {
    id: "sewing",
    title: "Sewing",
    fee: 1500,
    purpose: "Alterations and new garment tailoring",
    content: ["Types of stitches","Threading a sewing machine","Buttons, zips and hems","Design and sewing garments"]
  },
  "landscaping": {
    id: "landscaping",
    title: "Landscaping",
    fee: 1500,
    purpose: "Landscaping services for gardens",
    content: ["Plant selection","Garden layout","Fixed structures","Aesthetics"]
  },
  "life-skills": {
    id: "life-skills",
    title: "Life Skills",
    fee: 1500,
    purpose: "Navigate basic life necessities",
    content: ["Opening a bank account","Basic labour law","Basic literacy and numeracy"]
  },
  "child-minding": {
    id: "child-minding",
    title: "Child Minding",
    fee: 750,
    purpose: "Basic child and baby care",
    content: ["Newborn needs","Infant needs","Toddler care","Educational toys"]
  },
  "cooking": {
    id: "cooking",
    title: "Cooking",
    fee: 750,
    purpose: "Prepare nutritious family meals",
    content: ["Nutrition","Meal planning","Recipes","Cooking methods"]
  },
  "garden-maintenance": {
    id: "garden-maintenance",
    title: "Garden Maintenance",
    fee: 750,
    purpose: "Watering, pruning and planting",
    content: ["Water requirements","Pruning","Propagation","Planting techniques"]
  }
};

// initialize year placeholders
document.addEventListener('DOMContentLoaded', function () {
  ['year','year2','year3','year4','year5'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Date().getFullYear();
  });
  renderCourseCheckboxes();
});

// Renders course checkboxes inside calculator page
function renderCourseCheckboxes() {
  const container = document.getElementById('coursesCheckboxes');
  if (!container) return;
  container.innerHTML = '';
  Object.values(window.courseData).forEach(c => {
    const id = 'chk_' + c.id;
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `<input data-id="${c.id}" type="checkbox" id="${id}" name="courses" value="${c.id}" aria-label="${c.title}"> <span><strong>${c.title}</strong><br/><small class="muted">R${c.fee.toFixed(2)}</small></span>`;
    container.appendChild(wrapper);
  });

  // Basic wiring for buttons if not already attached
  const calcBtn = document.getElementById('calculateBtn');
  const resetBtn = document.getElementById('resetBtn');
  if (calcBtn) calcBtn.addEventListener('click', handleCalculate);
  if (resetBtn) resetBtn.addEventListener('click', handleReset);
}

// arithmetic helpers (digit-by-digit mindset implemented in code steps)
function sumFees(selectedIds) {
  // step 1: collect fees
  const fees = selectedIds.map(id => Number(window.courseData[id].fee));
  // step 2: sum them progressively
  let total = 0;
  for (let i = 0; i < fees.length; i++) {
    total = total + fees[i];
  }
  return total;
}

function computeDiscount(total, count) {
  // apply discount by rules:
  // 1 course -> 0%
  // 2 courses -> 5%
  // 3 courses -> 10%
  // more than 3 -> 15%
  let pct = 0;
  if (count === 2) pct = 0.05;
  else if (count === 3) pct = 0.10;
  else if (count > 3) pct = 0.15;
  const discount = Math.round((total * pct) * 100) / 100;
  return {discount, pct};
}

function computeVAT(amount) {
  // VAT is 15%
  const vat = Math.round((amount * 0.15) * 100) / 100;
  return vat;
}

function handleCalculate() {
  const errors = document.getElementById('errors');
  if (errors) errors.textContent = '';
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');

  // validation
  const missing = [];
  if (!name || !name.value.trim()) missing.push('Full name is required.');
  if (!phone || !/^[0-9+ ]{7,20}$/.test(phone.value.trim())) missing.push('Please enter a valid phone number.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) missing.push('Please enter a valid email address.');

  // gather selected courses
  const checkboxes = Array.from(document.querySelectorAll('input[name="courses"]:checked'));
  if (checkboxes.length === 0) missing.push('Please select at least one course.');

  if (missing.length) {
    if (errors) errors.innerHTML = '<ul><li>' + missing.join('</li><li>') + '</li></ul>';
    return;
  }

  const selectedIds = checkboxes.map(cb => cb.value);
  // compute totals step by step
  const subtotal = sumFees(selectedIds); // sum fees
  const {discount, pct} = computeDiscount(subtotal, selectedIds.length); // discount amount
  const afterDiscount = Math.round((subtotal - discount) * 100) / 100;
  const vat = computeVAT(afterDiscount); // vat
  const total = Math.round((afterDiscount + vat) * 100) / 100;

  // produce invoice HTML
  const invoice = document.getElementById('invoice');
  invoice.innerHTML = `
    <p><strong>Customer:</strong> ${escapeHtml(name.value)} • ${escapeHtml(phone.value)} • ${escapeHtml(email.value)}</p>
    <table class="invoice-table" style="width:100%;border-collapse:collapse">
      <thead><tr><th align="left">Course</th><th align="right">Fee</th></tr></thead>
      <tbody>
        ${selectedIds.map(id => `<tr><td>${escapeHtml(window.courseData[id].title)}</td><td align="right">R${window.courseData[id].fee.toFixed(2)}</td></tr>`).join('')}
        <tr><td><strong>Subtotal</strong></td><td align="right"><strong>R${subtotal.toFixed(2)}</strong></td></tr>
        <tr><td>Discount (${Math.round(pct*100)}%)</td><td align="right">- R${discount.toFixed(2)}</td></tr>
        <tr><td>After discount</td><td align="right">R${afterDiscount.toFixed(2)}</td></tr>
        <tr><td>VAT (15%)</td><td align="right">R${vat.toFixed(2)}</td></tr>
        <tr><td><strong>Total (quote)</strong></td><td align="right"><strong>R${total.toFixed(2)}</strong></td></tr>
      </tbody>
    </table>
  `;

  const quoteSection = document.getElementById('quoteResult');
  if (quoteSection) quoteSection.hidden = false;

  // Save quote to sessionStorage so user can revisit (simple state)
  sessionStorage.setItem('lastQuote', JSON.stringify({
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    selectedIds, subtotal, discount, vat, total
  }));
}

// reset form
function handleReset() {
  const form = document.getElementById('quoteForm');
  if (!form) return;
  form.reset();
  const invoice = document.getElementById('invoice');
  if (invoice) invoice.innerHTML = '';
  const quoteSection = document.getElementById('quoteResult');
  if (quoteSection) quoteSection.hidden = true;
  const errors = document.getElementById('errors');
  if (errors) errors.textContent = '';
}

// small HTML escape helper to avoid injection when adding user text to DOM
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
  });
}
