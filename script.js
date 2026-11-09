document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initProjectFilter();
  initLightbox();
  initScrollReveal();
  initContactForm();
  initTypingEffect();
});

function initNavbar() {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    highlightActiveNav();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let currentSection = '';

  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === currentSection);
  });
}

function initSmoothScroll() {
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
}

function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      cards.forEach(card => {
        const category = card.dataset.category;
        const matches = filter === 'all' || category === filter;

        if (matches) {
          card.classList.remove('hidden');
          requestAnimationFrame(() => card.classList.add('visible'));
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentIndex = 0;
  const items = Array.from(galleryItems);

  function openLightbox(index) {
    currentIndex = index;
    const item = items[currentIndex];
    lightboxImg.src = item.dataset.src;
    lightboxImg.alt = item.querySelector('img').alt;
    lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    items[currentIndex].querySelector('img').focus();
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + items.length) % items.length;
    const item = items[currentIndex];
    lightboxImg.src = item.dataset.src;
    lightboxImg.alt = item.querySelector('img').alt;
    lightboxCaption.textContent = item.dataset.caption || '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(1);
    if (e.key === 'ArrowRight') navigate(-1);
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentNode.querySelectorAll('.reveal'));
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      feedback.textContent = 'يرجى ملء جميع الحقول المطلوبة.';
      feedback.className = 'form-feedback error';
      return;
    }

    if (!isValidEmail(email)) {
      feedback.textContent = 'يرجى إدخال بريد إلكتروني صحيح.';
      feedback.className = 'form-feedback error';
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جارٍ الإرسال...';

    setTimeout(() => {
      feedback.textContent = 'شكرًا لتواصلك! سنرد عليك في أقرب وقت ممكن.';
      feedback.className = 'form-feedback success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'إرسال الرسالة';
    }, 1400);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initTypingEffect() {
  const target = document.getElementById('typed-text');
  if (!target) return;

  const phrase = 'بذكاء رقمي';
  const typeDelay = 90;
  const pauseAfter = 2200;
  const eraseDelay = 55;
  const pauseAfterErase = 500;

  let charIndex = 0;
  let isErasing = false;

  function tick() {
    if (!isErasing) {
      target.textContent = phrase.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === phrase.length) {
        isErasing = true;
        setTimeout(tick, pauseAfter);
        return;
      }
      setTimeout(tick, typeDelay);
    } else {
      target.textContent = phrase.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isErasing = false;
        setTimeout(tick, pauseAfterErase);
        return;
      }
      setTimeout(tick, eraseDelay);
    }
  }

  setTimeout(tick, 600);
}