// Starts everything when the page loads.
import { initNavMenu } from './nav-menu.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initActiveNav } from './active-nav.js';
import { initContactForm } from './contact-form.js';
import { initFooter } from './footer.js';
import { initExternalLinks } from './external-links.js';
import { initPerformance } from './performance.js';
import { initMotion } from './motion.js';
import { initMenuLightbox } from './menu-lightbox.js';

const toast = document.getElementById('toast');

const { navLinks } = initNavMenu();
initPerformance();
initMotion();
initSmoothScroll();
initActiveNav(navLinks);
initContactForm(toast);
initFooter();
initExternalLinks();
initMenuLightbox();
