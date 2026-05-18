/* ============================================================
   GENIUS GEMS — Main JavaScript
   ============================================================ */

// ---------- Navbar scroll effect ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});

// ---------- Curriculum tabs ----------
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${target}`).classList.add('active');
  });
});

// ---------- Scroll-triggered fade-in ----------
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.value-card, .curriculum-card, .team-card, .fee-card, .discount-card, .location-block, .about-features .feature-item, .contact-method'
).forEach((el, i) => {
  el.classList.add('fade-in');
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  observer.observe(el);
});

// ---------- Back to top ----------
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---------- Contact form — type toggle ----------
const typeBtns = document.querySelectorAll('.type-btn');
const enquiryFields = document.getElementById('enquiryFields');
const interestFields = document.getElementById('interestFields');
const formTypeInput = document.getElementById('formType');
const submitBtn = document.getElementById('submitBtn');

typeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    typeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.type;
    formTypeInput.value = type;
    if (type === 'enquiry') {
      enquiryFields.style.display = 'block';
      interestFields.style.display = 'none';
      submitBtn.setAttribute('data-i18n', 'contact.submit_enq');
      submitBtn.textContent = (window.geniusGemsT && window.geniusGemsT('contact.submit_enq')) || 'Send Enquiry';
    } else {
      enquiryFields.style.display = 'none';
      interestFields.style.display = 'block';
      submitBtn.setAttribute('data-i18n', 'contact.submit_int');
      submitBtn.textContent = (window.geniusGemsT && window.geniusGemsT('contact.submit_int')) || 'Register My Interest';
    }
  });
});

// ---------- Contact form — submit ----------
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = formTypeInput.value;

  // Validate: enquiry needs contact + message
  if (type === 'enquiry') {
    const contact = document.getElementById('enquiryContact').value.trim();
    const message = document.getElementById('enquiryMessage').value.trim();
    if (!contact || !message) {
      document.getElementById('enquiryContact').style.borderColor = contact ? '' : '#ff8fab';
      document.getElementById('enquiryMessage').style.borderColor = message ? '' : '#ff8fab';
      return;
    }
  }

  // Validate: interest needs at least one contact method + parent + child name
  if (type === 'interest') {
    const email = document.getElementById('interestEmail').value.trim();
    const phone = document.getElementById('interestPhone').value.trim();
    const parent = document.getElementById('parentName').value.trim();
    const child = document.getElementById('childName').value.trim();
    let valid = true;
    if (!parent) { document.getElementById('parentName').style.borderColor = '#ff8fab'; valid = false; }
    if (!child)  { document.getElementById('childName').style.borderColor = '#ff8fab';  valid = false; }
    if (!email && !phone) {
      document.getElementById('interestEmail').style.borderColor = '#ff8fab';
      document.getElementById('interestPhone').style.borderColor = '#ff8fab';
      valid = false;
    }
    if (!valid) return;
  }

  // Submit to Google Forms via fetch (no-cors, fire-and-forget).
  // We do NOT also submit via the iframe — doing both creates duplicate
  // rows in the linked Sheet.
  const FORM_ID = '1FAIpQLSdhrH1C9knKqzxzL0W7n34uvJO8cqbQMSYx7T1e6oexCQVndA';
  const BASE = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse?`;

  let params;
  if (type === 'enquiry') {
    const contact = document.getElementById('enquiryContact').value.trim();
    const message = document.getElementById('enquiryMessage').value.trim();
    // Put contact value into whichever field fits (phone if digits-only, else email)
    const isPhone = /^[\d\s\+\-]+$/.test(contact);
    params = new URLSearchParams({
      'entry.398255348': 'Enquiry',
      'entry.984577487': isPhone ? contact : '',
      'entry.646445583': isPhone ? '' : contact,
      'entry.1537606288': message,
    });
  } else {
    // The Google Form's "Interested Programme" question accepts only
    // "Full Day" or "Half Day" — sending the full label with the price
    // appended ("Full Day ($1,488/month)") is rejected with 400.
    const programmeRaw = document.getElementById('programme').value;
    let programme = '';
    if (programmeRaw.startsWith('Full Day')) programme = 'Full Day';
    else if (programmeRaw.startsWith('Half Day')) programme = 'Half Day';
    params = new URLSearchParams({
      'entry.398255348': 'Register Interest',
      'entry.1180059100': document.getElementById('parentName').value.trim(),
      'entry.211027780':  document.getElementById('childName').value.trim(),
      'entry.646445583':  document.getElementById('interestEmail').value.trim(),
      'entry.984577487':  document.getElementById('interestPhone').value.trim(),
      'entry.1430666171': programme,
      'entry.1537606288': document.getElementById('interestMessage').value.trim(),
    });
  }

  const submitUrl = BASE + params.toString();
  fetch(submitUrl, { method: 'POST', mode: 'no-cors' })
    .then(() => {
      console.info('[GeniusGems] Form submission dispatched to Google Forms. (Response is opaque due to CORS — verify in Google Sheet.)');
    })
    .catch((err) => {
      console.error('[GeniusGems] Form submission failed at network layer:', err);
      console.error('[GeniusGems] If you see 403/401 in the Network tab, the Google Form likely requires sign-in. In Settings, turn OFF "Limit to 1 response" and "Restrict to users in your organization".');
    });

  // Show success state
  contactForm.querySelectorAll('.form-type-toggle, #enquiryFields, #interestFields, #submitBtn').forEach(el => el.style.display = 'none');
  document.getElementById('formSuccess').style.display = 'block';
});

// ---------- Active nav link on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinkEls.forEach(link => {
    link.classList.remove('active-link');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active-link');
    }
  });
});
