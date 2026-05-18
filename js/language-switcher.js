let translations = {};
let currentLang = localStorage.getItem('geniusGems_language') || 'en';

// Cache commonly used translations
const textElements = {
  // Nav
  navHome: 'nav.home',
  navAbout: 'nav.about',
  navDifference: 'nav.difference',
  navValues: 'nav.values',
  navCurriculum: 'nav.curriculum',
  navTeam: 'nav.team',
  navFees: 'nav.fees',
  navLocation: 'nav.location',
  navEnrol: 'nav.enrol',

  // Form buttons
  formEnquiry: 'contact.submit',
  formRegister: 'contact.submit'
};

async function loadTranslations() {
  try {
    const response = await fetch('js/translations.json');
    translations = await response.json();
    translatePage(currentLang);
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
}

function getNestedTranslation(keyPath, lang) {
  const keys = keyPath.split('.');
  let value = translations[lang];
  for (const key of keys) {
    value = value?.[key];
  }
  return value;
}

function t(key, lang = currentLang) {
  return getNestedTranslation(key, lang) || key;
}

function setLanguage(lang) {
  if (!translations[lang]) {
    console.warn(`Language ${lang} not available`);
    return;
  }

  currentLang = lang;
  localStorage.setItem('geniusGems_language', lang);

  // Update current language display
  const currentLangSpan = document.getElementById('currentLang');
  if (currentLangSpan) {
    currentLangSpan.textContent = lang === 'en' ? 'EN' : lang.toUpperCase();
  }

  // Update document language attribute
  document.documentElement.lang = lang;

  // Close dropdown after selection
  const langDropdown = document.getElementById('langDropdown');
  if (langDropdown) {
    langDropdown.classList.remove('active');
  }

  // Translate the page
  translatePage(lang);
}

function translatePage(lang) {
  // Translate all data-translate elements
  const translatableElements = document.querySelectorAll('[data-translate]');
  translatableElements.forEach(el => {
    const key = el.getAttribute('data-translate');
    const text = t(key, lang);
    if (text && text !== key) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });

  // Translate all data-translate-html elements (for complex HTML content)
  const translatableHTMLElements = document.querySelectorAll('[data-translate-html]');
  translatableHTMLElements.forEach(el => {
    const key = el.getAttribute('data-translate-html');
    const text = t(key, lang);
    if (text && text !== key) {
      el.innerHTML = text;
    }
  });

  // Translate nav links
  translateNavLinks(lang);

  // Translate form labels and buttons
  translateFormElements(lang);
}

function translateNavLinks(lang) {
  const navLinks = document.querySelectorAll('.nav-links a');
  const navTexts = ['nav.home', 'nav.about', 'nav.difference', 'nav.values', 'nav.curriculum', 'nav.team', 'nav.fees', 'nav.location', 'nav.enrol'];

  navLinks.forEach((link, idx) => {
    if (navTexts[idx]) {
      const text = t(navTexts[idx], lang);
      if (text && text !== navTexts[idx]) {
        link.textContent = text;
      }
    }
  });
}

function translateFormElements(lang) {
  // Translate form labels
  const labels = document.querySelectorAll('label');
  const labelMap = {
    'Phone Number': 'contact.enquiry_contact',
    'Your Message': 'contact.enquiry_message',
    'Parent\'s Name': 'contact.parent_name',
    'Child\'s Name': 'contact.child_name',
    'Additional Notes': 'contact.notes',
    'Interested Programme': 'contact.programme'
  };

  labels.forEach(label => {
    const text = label.textContent.trim();
    if (labelMap[text]) {
      const translated = t(labelMap[text], lang);
      if (translated && translated !== labelMap[text]) {
        label.innerHTML = translated.replace('<span class="required-note">*</span>', '<span class="required-note">*</span>');
      }
    }
  });

  // Translate submit button
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    const formType = document.getElementById('formType')?.value || 'enquiry';
    submitBtn.textContent = t('contact.submit', lang);
  }
}

// Language toggle dropdown
document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langOptions = document.querySelectorAll('.lang-option');

  // Toggle dropdown
  if (langBtn) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown?.classList.toggle('active');
    });
  }

  // Language option click
  langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = option.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.language-toggle')) {
      langDropdown?.classList.remove('active');
    }
  });

  // Load translations on page load
  loadTranslations();
});
