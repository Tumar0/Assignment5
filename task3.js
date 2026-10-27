// ===== Task 3: Ticket Builder with live validation =====
const MAX_QTY = 10;
const BOOKING_CODE_LENGTH = 6;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const EVENTS = ['Tech Conference', 'Jazz Night', 'Startup Pitch Day'];

const TICKET_TYPES = [
  { id: 'standard', label: 'Standard', price: 50,  seatsLeft: 10 },
  { id: 'vip',      label: 'VIP',      price: 120, seatsLeft: 3 },
  { id: 'student',  label: 'Student',  price: 30,  seatsLeft: 5 }
];

const SOLD_OUT_DATES = ['2026-12-01', '2026-12-15', '2027-01-10'];

const PROMO_CODES = [
  { code: 'SAVE10',    discount: 0.10 },
  { code: 'WELCOME20', discount: 0.20 },
  { code: 'ASTANA30',  discount: 0.30 }
];

const BLOCKED_EMAIL_DOMAINS = ['mailinator.com', 'tempmail.com', '10minutemail.com'];

const form = document.getElementById('ticket-form');
const summary = document.getElementById('error-summary');
const resultEl = document.getElementById('result');
const fields = Array.from(form.querySelectorAll('input, select'));
const touched = new Set();

form.noValidate = true; // turn off browser messages, keep the attributes

// ---------- helpers ----------
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getType(id) {
  return TICKET_TYPES.find((t) => t.id === id);
}

function getPromo(text) {
  const code = text.trim().toUpperCase();
  return PROMO_CODES.find((p) => p.code === code);
}

function todayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function makeBookingCode() {
  let code = 'TKT-';
  for (let i = 0; i < BOOKING_CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length - 1)];
  }
  return code;
}

// ---------- validation rules (return an error text or '') ----------
const rules = {
  event(f) {
    return f.value === '' ? 'Choose an event.' : '';
  },
  date(f) {
    if (f.value === '') return 'Choose a date.';
    if (f.value < todayString()) return 'The date cannot be in the past.';
    if (SOLD_OUT_DATES.includes(f.value)) return 'Tickets for this date are sold out.';
    return '';
  },
  type(f) {
    if (f.value === '') return 'Choose a ticket type.';
    if (getType(f.value).seatsLeft === 0) return 'This ticket type is sold out.';
    return '';
  },
  quantity(f) {
    if (f.value === '') return 'Enter the quantity.';
    const q = Number(f.value);
    if (!Number.isInteger(q) || q < 1) return 'Quantity must be a whole number, 1 or more.';
    if (q > MAX_QTY) return `You can buy at most ${MAX_QTY} tickets at once.`;
    const type = getType(form.elements.type.value);
    if (type && q > type.seatsLeft) {
      return `Only ${type.seatsLeft} seat(s) left for ${type.label}.`;
    }
    return '';
  },
  fullName(f) {
    const v = f.value.trim();
    if (v === '') return 'Enter your name.';
    // at least two words, letters only (hyphen and apostrophe allowed)
    const re = /^\p{L}+(?:['-]\p{L}+)*(?:\s+\p{L}+(?:['-]\p{L}+)*)+$/u;
    return re.test(v) ? '' : 'Enter first and last name, letters only.';
  },
  email(f) {
    if (f.value.trim() === '') return 'Enter your email.';
    if (!f.checkValidity()) return 'Enter a valid email, e.g. name@example.com.';
    const domain = f.value.trim().split('@')[1].toLowerCase();
    if (BLOCKED_EMAIL_DOMAINS.includes(domain)) return 'Disposable email addresses are not accepted.';
    return '';
  },
  promo(f) {
    if (f.value.trim() === '') return ''; // optional
    return getPromo(f.value) ? '' : 'Unknown promo code.';
  }
};

function setError(field, message) {
  const errorEl = document.getElementById('error-' + field.name);
  errorEl.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  field.classList.toggle('valid', !message && field.value.trim() !== '');
}

// returns true when valid
function validateField(field) {
  const message = rules[field.name](field);
  setError(field, message);
  return message === '';
}

// ---------- seats text in the select ----------
function fillSelects() {
  for (const title of EVENTS) {
    form.elements.event.appendChild(new Option(title, title));
  }
  for (const t of TICKET_TYPES) {
    form.elements.type.appendChild(new Option('', t.id));
  }
  refreshTypeOptions();
  form.elements.date.min = todayString();
}

function refreshTypeOptions() {
  const select = form.elements.type;
  for (const option of select.options) {
    const t = getType(option.value);
    if (t) {
      option.textContent = `${t.label} — $${t.price} (${t.seatsLeft} left)`;
      option.disabled = t.seatsLeft === 0;
    }
  }
}

// ---------- live preview ----------
function updatePreview() {
  const el = (id) => document.getElementById('pv-' + id);
  const dash = (v) => (v && String(v).trim() !== '' ? v : '—');

  el('event').textContent = dash(form.elements.event.value);
  el('date').textContent = dash(form.elements.date.value);

  const type = getType(form.elements.type.value);
  el('type').textContent = type ? `${type.label} ($${type.price})` : '—';
  el('quantity').textContent = dash(form.elements.quantity.value);
  el('fullName').textContent = dash(form.elements.fullName.value);
  el('email').textContent = dash(form.elements.email.value);

  const promo = getPromo(form.elements.promo.value);
  el('discount').textContent = promo ? `${promo.code} (−${Math.round(promo.discount * 100)}%)` : '—';

  const qty = Number(form.elements.quantity.value);
  if (type && Number.isInteger(qty) && qty > 0) {
    const total = type.price * qty * (1 - (promo ? promo.discount : 0));
    el('total').textContent = `$${total.toFixed(2)}`;
  } else {
    el('total').textContent = '—';
  }
}

// ---------- events ----------
for (const field of fields) {
  // checked on blur first…
  field.addEventListener('blur', () => {
    touched.add(field.name);
    validateField(field);
  });
  // …then on every input
  field.addEventListener('input', () => {
    if (touched.has(field.name)) validateField(field);
    // quantity depends on the ticket type
    if (field.name === 'type' && touched.has('quantity')) {
      validateField(form.elements.quantity);
    }
    updatePreview();
  });
}

function buildTicket(data) {
  const ticket = document.createElement('div');
  ticket.className = 'ticket';

  const h = document.createElement('h3');
  h.textContent = '🎫 Your ticket';

  const lines = [
    ['Event', data.event],
    ['Date', data.date],
    ['Type', `${data.typeLabel} × ${data.quantity}`],
    ['Name', data.name],
    ['Email', data.email],
    ['Total', `$${data.total.toFixed(2)}`]
  ];
  ticket.appendChild(h);
  for (const [label, value] of lines) {
    const p = document.createElement('p');
    const b = document.createElement('strong');
    b.textContent = label + ': ';
    p.append(b, value);
    ticket.appendChild(p);
  }

  const code = document.createElement('p');
  code.className = 'code';
  code.textContent = data.code;
  ticket.appendChild(code);
  return ticket;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  let errorCount = 0;
  let firstInvalid = null;
  for (const field of fields) {
    touched.add(field.name);
    if (!validateField(field)) {
      errorCount++;
      if (firstInvalid === null) firstInvalid = field;
    }
  }

  if (errorCount > 0) {
    summary.textContent = `Please fix ${errorCount} error${errorCount === 1 ? '' : 's'} below.`;
    summary.classList.remove('hidden');
    firstInvalid.focus();
    return;
  }

  // success: collect data BEFORE reset
  const type = getType(form.elements.type.value);
  const qty = Number(form.elements.quantity.value);
  const promo = getPromo(form.elements.promo.value);
  const data = {
    event: form.elements.event.value,
    date: form.elements.date.value,
    typeLabel: type.label,
    quantity: qty,
    name: form.elements.fullName.value.trim(),
    email: form.elements.email.value.trim(),
    total: type.price * qty * (1 - (promo ? promo.discount : 0)),
    code: makeBookingCode()
  };

  type.seatsLeft -= qty; // seats are taken

  resultEl.replaceChildren(buildTicket(data));
  form.reset();
  touched.clear();
  for (const field of fields) {
    setError(field, '');
    field.classList.remove('valid');
  }
  summary.classList.add('hidden');
  refreshTypeOptions();
  updatePreview();
});

fillSelects();
updatePreview();
