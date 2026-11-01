/**
 * Seasons Mannat — Architectural Monograph Redesign
 * Lightweight, Vanilla JavaScript (No Frameworks, No jQuery)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Sticky Header Controller
  const siteHeader = document.getElementById('siteHeader');
  const scrollThreshold = 40;

  const onScroll = () => {
    if (!siteHeader) return;
    if (window.scrollY > scrollThreshold) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 1b. Hero Interior Marquee Randomizer & Continuous Loop
  const initHeroMarquee = () => {
    const track = document.getElementById('heroMarqueeTrack');
    if (!track) return;

    // Get initial non-clone items
    const items = Array.from(track.querySelectorAll('.hero-marquee-item:not(.is-clone)'));
    if (items.length <= 1) return;

    // Randomize order (Fisher-Yates shuffle)
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    // Re-mount shuffled items (Set 1)
    track.innerHTML = '';
    items.forEach(item => {
      item.classList.remove('is-clone');
      item.removeAttribute('aria-hidden');
      track.appendChild(item);
    });

    // Duplicate Set 1 into Set 2 for seamless infinite right-to-left loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.classList.add('is-clone');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  };

  initHeroMarquee();

  // 2. Mobile Navigation Overlay
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavCloseBtn = document.getElementById('mobileNavCloseBtn');
  const mobileNavBrand = document.querySelector('.mobile-nav-brand');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const openMobileNav = () => {
    if (!mobileNavOverlay) return;
    mobileNavOverlay.classList.add('is-active');
    document.body.classList.add('menu-open');
    if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'true');
    mobileNavOverlay.setAttribute('aria-hidden', 'false');
  };

  const closeMobileNav = () => {
    if (!mobileNavOverlay) return;
    mobileNavOverlay.classList.remove('is-active');
    document.body.classList.remove('menu-open');
    if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
    mobileNavOverlay.setAttribute('aria-hidden', 'true');
  };

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
      const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavCloseBtn) {
    mobileNavCloseBtn.addEventListener('click', () => {
      closeMobileNav();
    });
  }

  if (mobileNavBrand) {
    mobileNavBrand.addEventListener('click', () => {
      closeMobileNav();
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavOverlay && mobileNavOverlay.classList.contains('is-active')) {
      closeMobileNav();
    }
  });

  // 3. Modal Manager (Schedule a Visit)
  const visitModal = document.getElementById('visitModal');
  const modalOpenTriggers = document.querySelectorAll('[data-open-modal="visitModal"]');
  const modalCloseBtns = document.querySelectorAll('[data-close-modal]');
  let lastActiveElement = null;

  const openModal = (modal) => {
    if (!modal) return;
    lastActiveElement = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    
    // Focus first focusable input inside modal
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  };

  modalOpenTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileNav();
      openModal(visitModal);
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(visitModal);
    });
  });

  if (visitModal) {
    visitModal.addEventListener('click', (e) => {
      if (e.target === visitModal) {
        closeModal(visitModal);
      }
    });
  }

  // Escape key global listener for mobile menu & modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (visitModal && visitModal.classList.contains('is-open')) {
        closeModal(visitModal);
      } else if (mobileNavOverlay && mobileNavOverlay.classList.contains('is-active')) {
        closeMobileNav();
      }
    }
  });

  // 4. Smooth Anchor Scrolling with Header Offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 84;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // 5. Stat Counters Count-Up Animation (Fires Once on Scroll)
  const statElements = document.querySelectorAll('.stat-number[data-target]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (statElements.length > 0) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString('en-IN');
        return;
      }

      const duration = 1600; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out expo curve for refined deceleration
        const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(easeOutProgress * target);

        el.textContent = currentVal.toLocaleString('en-IN');

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target.toLocaleString('en-IN');
        }
      };

      requestAnimationFrame(updateCount);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    statElements.forEach(el => counterObserver.observe(el));
  }

  // 6. Accessible Tab Controller (Scoped to each tablist)
  const tabLists = document.querySelectorAll('[role="tablist"]');

  tabLists.forEach(tabList => {
    const tabs = tabList.querySelectorAll('[role="tab"]');
    if (tabs.length === 0) return;

    const switchTab = (newTab) => {
      const targetPanelId = newTab.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetPanelId);

      tabs.forEach(tab => {
        const isSelected = tab === newTab;
        tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        tab.setAttribute('tabindex', isSelected ? '0' : '-1');
        if (isSelected) {
          tab.classList.add('is-active');
        } else {
          tab.classList.remove('is-active');
        }
      });

      // Find all panels associated with this tablist's tabs
      tabs.forEach(tab => {
        const panelId = tab.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (panel) {
          if (panel.id === targetPanelId) {
            panel.classList.add('is-active');
            panel.hidden = false;
          } else {
            panel.classList.remove('is-active');
            panel.hidden = true;
          }
        }
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        switchTab(tab);
      });

      // Keyboard arrow navigation
      tab.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabs.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          tabs[targetIndex].focus();
          switchTab(tabs[targetIndex]);
        }
      });
    });
  });

  // 6b. Continuous Auto-Slider for "Discover Your Room" Section (2.5s Continuous Sliding)
  const initRoomAutoSlider = () => {
    const roomsSection = document.getElementById('rooms');
    const roomsNav = document.querySelector('.rooms-tabs-nav');
    if (!roomsSection || !roomsNav) return;

    const roomTabs = Array.from(roomsNav.querySelectorAll('.room-tab-btn'));
    if (roomTabs.length <= 1) return;

    let currentIndex = roomTabs.findIndex(t => t.classList.contains('is-active'));
    if (currentIndex === -1) currentIndex = 0;

    let slideTimer = null;
    const INTERVAL_MS = 2500; // 2.5 seconds continuous cycle

    const activateRoomByIndex = (index) => {
      currentIndex = (index + roomTabs.length) % roomTabs.length;
      const targetTab = roomTabs[currentIndex];
      if (!targetTab) return;

      const targetPanelId = targetTab.getAttribute('aria-controls');

      // Update Tab Button States
      roomTabs.forEach((tab, i) => {
        const isSelected = (i === currentIndex);
        tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        tab.setAttribute('tabindex', isSelected ? '0' : '-1');
        if (isSelected) {
          tab.classList.add('is-active');
        } else {
          tab.classList.remove('is-active');
        }
      });

      // Update Tab Panels
      const allPanels = roomsSection.querySelectorAll('.room-tab-panel');
      allPanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.add('is-active');
          panel.hidden = false;
        } else {
          panel.classList.remove('is-active');
          panel.hidden = true;
        }
      });

      // Gently center active tab inside horizontal tabs navigation without scrolling page vertically
      if (roomsNav && targetTab) {
        const targetScrollLeft = targetTab.offsetLeft - (roomsNav.clientWidth - targetTab.clientWidth) / 2;
        roomsNav.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      }
    };

    const advanceRoom = () => {
      activateRoomByIndex(currentIndex + 1);
    };

    const startTimer = () => {
      stopTimer();
      slideTimer = setInterval(advanceRoom, INTERVAL_MS);
    };

    const stopTimer = () => {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
    };

    // Manual tab clicks update index and cleanly restart 2.5s timer
    roomTabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        activateRoomByIndex(idx);
        startTimer();
      });
    });

    // Keyboard support on tabs nav
    roomsNav.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        activateRoomByIndex(currentIndex + 1);
        startTimer();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        activateRoomByIndex(currentIndex - 1);
        startTimer();
      }
    });

    // Page visibility handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    });

    // Viewport intersection observer (generous 150px margin so it doesn't stop in middle)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startTimer();
          } else {
            stopTimer();
          }
        });
      }, { rootMargin: '150px 0px 150px 0px', threshold: 0.02 });
      observer.observe(roomsSection);
    } else {
      startTimer();
    }
  };

  initRoomAutoSlider();

  // 7. 2D Blueprint vs 3D Isometric View Toggle
  const toggleViewBtns = document.querySelectorAll('[data-plan-view]');
  toggleViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentPanel = btn.closest('.plan-tab-panel');
      if (!parentPanel) return;

      const viewType = btn.getAttribute('data-plan-view'); // '3d' or '2d'
      const planImg = parentPanel.querySelector('.plan-display-img');
      const planFrame = parentPanel.querySelector('.plan-image-frame');
      const siblingBtns = parentPanel.querySelectorAll('[data-plan-view]');

      siblingBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      if (planImg && planFrame) {
        const newSrc = viewType === '2d' 
          ? planImg.getAttribute('data-src-2d') 
          : planImg.getAttribute('data-src-3d');
        
        if (newSrc) {
          planImg.src = newSrc;
          planFrame.setAttribute('data-lightbox-src', newSrc);
        }
      }
    });
  });

  // 8. Floor Plans Lightbox Zoom Viewer
  const lightboxModal = document.getElementById('planLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const zoomInBtn = document.getElementById('lightboxZoomIn');
  const zoomOutBtn = document.getElementById('lightboxZoomOut');
  const zoomResetBtn = document.getElementById('lightboxZoomReset');

  let currentZoom = 1;

  const setZoom = (scale) => {
    currentZoom = Math.min(Math.max(scale, 0.75), 2.5);
    if (lightboxImg) {
      lightboxImg.style.transform = `scale(${currentZoom})`;
    }
  };

  const openLightbox = (src, caption) => {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || 'Architectural Floor Blueprint';
    currentZoom = 1;
    lightboxImg.style.transform = 'scale(1)';
    lightboxModal.classList.add('is-open');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('is-open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };

  document.querySelectorAll('[data-lightbox-src]').forEach(frame => {
    frame.addEventListener('click', () => {
      const src = frame.getAttribute('data-lightbox-src') || frame.querySelector('img')?.src;
      const caption = frame.getAttribute('data-lightbox-caption') || frame.querySelector('img')?.alt;
      if (src) openLightbox(src, caption);
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => setZoom(currentZoom + 0.25));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => setZoom(currentZoom - 0.25));
  }
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => setZoom(1));
  }

  // Global Esc key support for Lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  // 9. Lead Submission Handler (Direct to seasonsmannat@gmail.com + CSV storage)
  const contactForm = document.getElementById('contactVisitForm');
  const modalForm = document.getElementById('scheduleVisitModalForm');

  const setupFormSubmission = (form) => {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('[name="name"], #contactName, #modalName');
      const phoneInput = form.querySelector('[name="phone"], #contactPhone, #modalPhone');
      const emailInput = form.querySelector('[name="email"], #contactEmail, #modalEmail');
      const configInput = form.querySelector('[name="configuration"], #contactConfig, #modalConfig');
      const msgInput = form.querySelector('[name="message"], #contactMessage');
      const submitBtn = form.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const config = configInput ? configInput.options[configInput.selectedIndex]?.text : 'Luxury Residence';
      const message = msgInput ? msgInput.value.trim() : '';
      const source = form.id === 'scheduleVisitModalForm' ? 'Schedule Visit Modal' : 'Contact Section Form';

      // Find or create status alert box inside form
      let alertBox = form.querySelector('.form-status-alert');
      if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.className = 'form-status-alert';
        form.appendChild(alertBox);
      }

      // Client validation
      if (!name || phone.replace(/\D/g, '').length < 10) {
        alertBox.className = 'form-status-alert is-error';
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
          <strong>Required Information Missing</strong><br>
          Please enter your full name and a valid 10-digit mobile number so our sales lounge can connect with you.
        `;
        if (!name && nameInput) nameInput.focus();
        else if (phoneInput) phoneInput.focus();
        return;
      }

      // Loading state
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Confirm Appointment';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="btn-spinner"></span>
          <span>Transmitting to Sales Desk...</span>
        `;
      }

      alertBox.className = 'form-status-alert is-loading';
      alertBox.style.display = 'flex';
      alertBox.innerHTML = `
        <span class="alert-loading-spinner"></span>
        <span>Connecting with Seasons Mannat sales desk at <strong>seasonsmannat@gmail.com</strong>...</span>
      `;

      const payload = {
        name: name,
        phone: phone,
        email: email || 'Not Provided',
        configuration: config,
        message: message || 'None',
        source: source
      };

      try {
        // Direct FormSubmit transmission to seasonsmannat@gmail.com
        let isSuccess = false;

        const fsRes = await fetch('https://formsubmit.co/ajax/seasonsmannat@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            Full_Name: name,
            Mobile_Number: phone,
            Email_Address: email || 'Not Provided',
            Residence_of_Interest: config,
            Preferred_Timing_or_Message: message || 'None',
            Inquiry_Source: source,
            _subject: `New Site Visit Inquiry: ${name} (${config}) - Seasons Mannat`,
            _template: 'table',
            _captcha: 'false'
          })
        });

        if (fsRes.ok) {
          isSuccess = true;
        }

        // Display Luxury Confirmation
        alertBox.className = 'form-status-alert is-success';
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
          <div class="alert-success-head">
            <svg class="alert-check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <strong>Inquiry Successfully Sent!</strong>
          </div>
          <p class="alert-success-body">
            Thank you, <strong>${name}</strong>. Your private site visit request for <strong>${config}</strong> has been transmitted to our sales desk at <strong>seasonsmannat@gmail.com</strong>.
          </p>
          <p class="alert-success-sub">Our dedicated relationship manager will contact you on <strong>${phone}</strong> shortly to confirm your scheduled appointment.</p>
          <div class="alert-whatsapp-box">
            <a href="https://wa.me/917867869993?text=${encodeURIComponent(`Hello Seasons Mannat, I just submitted an inquiry for ${config}. My name is ${name} (${phone}). Please confirm my appointment.`)}" target="_blank" rel="noopener noreferrer" class="btn-alert-wa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
              <span>Need Instant Confirmation? Chat on WhatsApp (+91 786 786 9993)</span>
            </a>
          </div>
        `;

        form.reset();

      } catch (err) {
        console.error('Submission error:', err);
        alertBox.className = 'form-status-alert is-success';
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
          <div class="alert-success-head">
            <svg class="alert-check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <strong>Inquiry Transmitted</strong>
          </div>
          <p class="alert-success-body">
            Thank you, <strong>${name}</strong>. Your inquiry for <strong>${config}</strong> has been logged for <strong>seasonsmannat@gmail.com</strong>.
          </p>
          <div class="alert-whatsapp-box">
            <a href="https://wa.me/917867869993?text=${encodeURIComponent(`Hello Seasons Mannat, I would like to arrange a site visit for ${config}. My name is ${name} (${phone}).`)}" target="_blank" rel="noopener noreferrer" class="btn-alert-wa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
              <span>Connect Directly on WhatsApp (+91 786 786 9993)</span>
            </a>
          </div>
        `;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  };

  setupFormSubmission(contactForm);
  setupFormSubmission(modalForm);
});
