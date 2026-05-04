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
      submitBtn.textContent = 'Send Enquiry';
    } else {
      enquiryFields.style.display = 'none';
      interestFields.style.display = 'block';
      submitBtn.textContent = 'Register My Interest';
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

  // Build Google Forms URL — replace entry IDs after you set up your form
  const ENQUIRY_URL  = 'YOUR_ENQUIRY_GOOGLE_FORM_URL';
  const INTEREST_URL = 'YOUR_INTEREST_GOOGLE_FORM_URL';

  // Show success immediately (Google Forms submissions are fire-and-forget via hidden iframe)
  const iframe = document.getElementById('formIframe');
  if (type === 'enquiry') {
    const contact = encodeURIComponent(document.getElementById('enquiryContact').value.trim());
    const message = encodeURIComponent(document.getElementById('enquiryMessage').value.trim());
    iframe.src = `${ENQUIRY_URL}&entry.CONTACT_ID=${contact}&entry.MESSAGE_ID=${message}`;
  } else {
    const parent   = encodeURIComponent(document.getElementById('parentName').value.trim());
    const child    = encodeURIComponent(document.getElementById('childName').value.trim());
    const email    = encodeURIComponent(document.getElementById('interestEmail').value.trim());
    const phone    = encodeURIComponent(document.getElementById('interestPhone').value.trim());
    const prog     = encodeURIComponent(document.getElementById('programme').value);
    const notes    = encodeURIComponent(document.getElementById('interestMessage').value.trim());
    iframe.src = `${INTEREST_URL}&entry.PARENT_ID=${parent}&entry.CHILD_ID=${child}&entry.EMAIL_ID=${email}&entry.PHONE_ID=${phone}&entry.PROG_ID=${prog}&entry.NOTES_ID=${notes}`;
  }

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
