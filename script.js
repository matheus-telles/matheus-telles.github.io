const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const sections = document.querySelectorAll('section[id], header[id], footer[id]');
const navLinkByHash = new Map(
    Array.from(navLinks.querySelectorAll('.nav-link')).map((link) => [link.getAttribute('href'), link])
);

const spyObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const link = navLinkByHash.get(`#${entry.target.id}`);
            if (!link) return;
            if (entry.isIntersecting) {
                navLinkByHash.forEach((l) => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    },
    { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => spyObserver.observe(section));
