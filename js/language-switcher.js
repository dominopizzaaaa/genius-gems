/* ============================================================
   GENIUS GEMS — Language Switcher
   ============================================================ */

let translations = {};
let currentLang = localStorage.getItem('geniusGems_language') || 'en';

async function loadTranslations() {
  try {
    const response = await fetch('js/translations.json?v=20260518d');
    translations = await response.json();
    applyLanguage(currentLang);
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
}

function t(keyPath, lang) {
  const keys = keyPath.split('.');
  let value = translations[lang];
  for (const key of keys) {
    if (value == null) return null;
    value = value[key];
  }
  return value;
}

function applyLanguage(lang) {
  if (!translations[lang]) {
    console.warn(`Language ${lang} not loaded`);
    return;
  }

  currentLang = lang;
  localStorage.setItem('geniusGems_language', lang);
  document.documentElement.lang = lang;

  // Update language button label
  const currentLangSpan = document.getElementById('currentLang');
  if (currentLangSpan) {
    currentLangSpan.textContent = lang.toUpperCase();
  }

  // Mark active option
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
  });

  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key, lang);
    if (value != null) el.textContent = value;
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = t(key, lang);
    if (value != null) el.placeholder = value;
  });

  // Translate aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const value = t(key, lang);
    if (value != null) el.setAttribute('aria-label', value);
  });

  // Translate HTML content (rare — only when innerHTML is needed)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const value = t(key, lang);
    if (value != null) el.innerHTML = value;
  });

  // Translate <option> elements via data-i18n-text
  document.querySelectorAll('option[data-i18n]').forEach(opt => {
    const key = opt.getAttribute('data-i18n');
    const value = t(key, lang);
    if (value != null) opt.textContent = value;
  });

  // Update form submit button based on current type
  const formTypeInput = document.getElementById('formType');
  const submitBtn = document.getElementById('submitBtn');
  if (formTypeInput && submitBtn) {
    const type = formTypeInput.value;
    const key = type === 'interest' ? 'contact.submit_int' : 'contact.submit_enq';
    const value = t(key, lang);
    if (value != null) submitBtn.textContent = value;
  }
}

// Expose for main.js to call when toggling enquiry/interest
window.geniusGemsT = (key) => t(key, currentLang);
window.geniusGemsLang = () => currentLang;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langOptions = document.querySelectorAll('.lang-option');

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });
  }

  langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = option.getAttribute('data-lang');
      applyLanguage(lang);
      langDropdown?.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.language-toggle')) {
      langDropdown?.classList.remove('active');
    }
  });

  loadTranslations();
});
