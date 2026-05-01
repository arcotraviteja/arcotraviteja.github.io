// =============================================
// RAVI TEJA A — PORTFOLIO
// =============================================

document.addEventListener('DOMContentLoaded', () => initializeApp());

async function initializeApp() {
    try {
        await Promise.all([
            loadSiteConfig(),
            loadNavigation(),
            loadHero(),
            loadAbout(),
            loadExperience(),
            loadProjects(),
            loadSkills(),
            loadEducation(),
            loadContact(),
            loadFooter()
        ]);
        initializeNavigation();
        initializeScrollEffects();
        initializeBackToTop();
        initializeScrollProgress();
        initializeTypewriter();
        initializeNavbarScroll();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// ----- helpers -----
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Logo with graceful fallback to icon/emoji on image error
function logoMarkup({ logo, fallback, fallbackIcon, alt }) {
    const safeAlt = escapeHtml(alt || '');
    const fallbackHtml = fallbackIcon
        ? `<i class="${escapeHtml(fallbackIcon)} logo-fallback-icon"></i>`
        : `<span class="logo-fallback">${escapeHtml(fallback || '•')}</span>`;
    if (!logo) return fallbackHtml;
    // Encode the fallback HTML as JSON so quotes in the onerror handler are safe
    const encoded = JSON.stringify(fallbackHtml).replace(/"/g, '&quot;');
    return `<img src="${escapeHtml(logo)}" alt="${safeAlt}" loading="lazy"
            onerror="this.outerHTML=${encoded}">`;
}

// ----- loaders -----
async function loadSiteConfig() {
    try {
        const data = await fetch('data/site-config.json').then(r => r.json());
        const meta = data.meta || data;
        document.title = meta.title || 'Portfolio';
        const desc = document.querySelector('meta[name="description"]');
        const author = document.querySelector('meta[name="author"]');
        if (desc && meta.description) desc.content = meta.description;
        if (author && meta.author) author.content = meta.author;
    } catch (error) {
        console.error('Error loading site config:', error);
    }
}

async function loadNavigation() {
    try {
        const data = await fetch('data/navigation.json').then(r => r.json());
        const brand = document.getElementById('nav-brand');
        if (brand) {
            const name = data.brand?.name || 'Portfolio';
            // Use initials for compact brand mark
            const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            brand.textContent = initials;
            brand.setAttribute('title', name);
            if (data.brand?.href) brand.setAttribute('href', data.brand.href);
        }
        const menu = document.getElementById('nav-menu');
        if (menu && Array.isArray(data.menuItems)) {
            menu.innerHTML = data.menuItems.map(item =>
                `<li><a href="${escapeHtml(item.href)}" class="nav-link">${escapeHtml(item.text)}</a></li>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

async function loadHero() {
    try {
        const data = await fetch('data/hero.json').then(r => r.json());

        document.getElementById('hero-greeting').textContent = data.greeting || '';
        document.getElementById('hero-name').textContent = data.name || '';
        // Title text rendered later via typewriter
        document.getElementById('hero-title-text').dataset.text = data.title || '';
        document.getElementById('hero-tagline').textContent = data.tagline || '';
        document.getElementById('hero-description').textContent = data.description || '';

        const ctaEl = document.getElementById('hero-cta');
        if (ctaEl) {
            const buttons = (data.cta && data.cta.buttons) || (Array.isArray(data.cta) ? data.cta : []);
            ctaEl.innerHTML = buttons.map(btn =>
                `<a href="${escapeHtml(btn.href)}" class="btn btn-${escapeHtml(btn.type || 'primary')}">
                    <span>${escapeHtml(btn.text)}</span>
                    <i class="fas fa-arrow-right"></i>
                </a>`
            ).join('');
        }

        const socialEl = document.getElementById('hero-social');
        if (socialEl && data.socialLinks) {
            socialEl.innerHTML = data.socialLinks.map(link =>
                `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" class="social-link" aria-label="${escapeHtml(link.platform)}">
                    <i class="${escapeHtml(link.icon)}"></i>
                </a>`
            ).join('');
        }

        const statsEl = document.getElementById('hero-stats');
        if (statsEl) {
            const items = data.stats || data.highlights || [];
            statsEl.innerHTML = items.map(item => {
                const value = item.value || item.number || item.text || '';
                const icon = item.icon ? `<i class="${escapeHtml(item.icon)}"></i>` : '';
                return `<div class="stat-item">
                    ${icon}
                    <span class="stat-number">${escapeHtml(value)}</span>
                    <span class="stat-label">${escapeHtml(item.label || '')}</span>
                </div>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading hero:', error);
    }
}

async function loadAbout() {
    try {
        const data = await fetch('data/about.json').then(r => r.json());
        const titleEl = document.getElementById('about-title');
        if (titleEl) titleEl.textContent = data.sectionTitle || 'About';
        document.getElementById('about-content').innerHTML =
            (data.content || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
        document.getElementById('about-highlights').innerHTML =
            (data.highlights || []).map(h =>
                `<div class="highlight-card">
                    <i class="${escapeHtml(h.icon)}"></i>
                    <h3>${escapeHtml(h.title)}</h3>
                    <p>${escapeHtml(h.description)}</p>
                </div>`
            ).join('');
    } catch (error) {
        console.error('Error loading about:', error);
    }
}

async function loadExperience() {
    try {
        const data = await fetch('data/experience.json').then(r => r.json());
        const titleEl = document.getElementById('experience-title');
        const subtitleEl = document.getElementById('experience-subtitle');
        const timeline = document.getElementById('experience-timeline');
        if (titleEl) titleEl.textContent = data.sectionTitle || 'Experience';
        if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
        if (!timeline) return;

        const items = data.experiences || [];
        timeline.innerHTML = items.map((exp, idx) => {
            const accent = exp.accentColor || '#06B6D4';
            const tech = (exp.tech || []).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');
            const bullets = (exp.responsibilities || []).map(r => `<li>${escapeHtml(r)}</li>`).join('');
            const companyLink = exp.companyUrl
                ? `<a href="${escapeHtml(exp.companyUrl)}" target="_blank" rel="noopener" class="exp-company">${escapeHtml(exp.company)} <i class="fas fa-arrow-up-right-from-square"></i></a>`
                : `<span class="exp-company">${escapeHtml(exp.company)}</span>`;

            return `<article class="timeline-item" style="--accent:${escapeHtml(accent)}">
                <div class="timeline-marker">
                    <div class="timeline-logo">
                        ${logoMarkup({ logo: exp.logo, fallback: exp.logoFallback, alt: exp.company })}
                    </div>
                </div>
                <div class="timeline-content">
                    <div class="exp-header">
                        <div>
                            <h3 class="exp-title">${escapeHtml(exp.title)}</h3>
                            <div class="exp-meta">
                                ${companyLink}
                                ${exp.location ? `<span class="exp-dot">·</span><span class="exp-location"><i class="fas fa-location-dot"></i> ${escapeHtml(exp.location)}</span>` : ''}
                            </div>
                        </div>
                        <span class="exp-period"><i class="far fa-calendar"></i> ${escapeHtml(exp.period)}</span>
                    </div>
                    <ul class="exp-bullets">${bullets}</ul>
                    <div class="exp-tech">${tech}</div>
                </div>
            </article>`;
        }).join('');
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

async function loadProjects() {
    try {
        const data = await fetch('data/projects.json').then(r => r.json());
        const workTitle = document.getElementById('work-title');
        const workSubtitle = document.getElementById('work-subtitle');
        if (workTitle) workTitle.textContent = data.sectionTitle || 'Projects';
        if (workSubtitle) workSubtitle.textContent = data.subtitle || '';

        const workGrid = document.getElementById('work-grid');
        const projects = data.projects || data.items || [];

        if (workGrid && projects.length > 0) {
            workGrid.innerHTML = projects.map(project => {
                const tags = project.technologies || project.tags || [];
                const links = project.links || {};
                const ghHref = links.github || project.github || '';
                const demoHref = links.demo || project.demo || '';
                const linksHtml = `
                    ${ghHref ? `<a href="${escapeHtml(ghHref)}" target="_blank" rel="noopener" class="work-link" aria-label="GitHub"><i class="fab fa-github"></i></a>` : ''}
                    ${demoHref && demoHref !== ghHref ? `<a href="${escapeHtml(demoHref)}" target="_blank" rel="noopener" class="work-link" aria-label="Demo"><i class="fas fa-arrow-up-right-from-square"></i></a>` : ''}
                `;
                return `<article class="work-card${project.featured ? ' work-card-featured' : ''}">
                    <div class="work-card-top">
                        <div class="work-icon"><i class="${escapeHtml(project.icon || 'fas fa-folder')}"></i></div>
                        <div class="work-links">${linksHtml}</div>
                    </div>
                    <p class="work-category">${escapeHtml(project.category || '')}</p>
                    <h3 class="work-title">${escapeHtml(project.title)}</h3>
                    <p class="work-description">${escapeHtml(project.description)}</p>
                    <div class="work-tags">
                        ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </article>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadSkills() {
    try {
        const data = await fetch('data/skills.json').then(r => r.json());
        const titleEl = document.getElementById('skills-title');
        if (titleEl) titleEl.textContent = data.sectionTitle || 'Skills';
        document.getElementById('skills-grid').innerHTML = (data.categories || []).map(cat => {
            const name = cat.category || cat.name || '';
            return `<div class="skill-category">
                <div class="skill-category-header">
                    <i class="${escapeHtml(cat.icon || 'fas fa-code')}"></i>
                    <h3 class="skill-category-name">${escapeHtml(name)}</h3>
                </div>
                <div class="skill-list">
                    ${(cat.skills || []).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

async function loadEducation() {
    try {
        const data = await fetch('data/education.json').then(r => r.json());
        const titleEl = document.getElementById('education-title');
        if (titleEl) titleEl.textContent = data.sectionTitle || 'Education & Certifications';

        const eduList = document.getElementById('education-list');
        if (eduList) {
            eduList.innerHTML = (data.education || []).map(edu => `
                <article class="edu-card">
                    <div class="edu-logo">
                        ${logoMarkup({ logo: edu.logo, fallback: edu.logoFallback || '🎓', alt: edu.school })}
                    </div>
                    <div class="edu-body">
                        <h3 class="edu-degree">${escapeHtml(edu.degree)}</h3>
                        <p class="edu-school">${escapeHtml(edu.school)}${edu.location ? ' · ' + escapeHtml(edu.location) : ''}</p>
                        <p class="edu-period"><i class="far fa-calendar"></i> ${escapeHtml(edu.period)}</p>
                        ${edu.description ? `<p class="edu-desc">${escapeHtml(edu.description)}</p>` : ''}
                    </div>
                </article>
            `).join('');
        }

        const certList = document.getElementById('cert-list');
        if (certList) {
            const certHeader = `<h3 class="cert-header"><i class="fas fa-medal"></i> Certifications</h3>`;
            certList.innerHTML = certHeader + (data.certifications || []).map(c => `
                <article class="cert-card">
                    <div class="cert-logo">
                        ${logoMarkup({ logo: c.logo, fallbackIcon: c.icon || 'fas fa-award', alt: c.issuer })}
                    </div>
                    <div>
                        <h4 class="cert-name">${escapeHtml(c.name)}</h4>
                        <p class="cert-issuer">${escapeHtml(c.issuer)}</p>
                    </div>
                </article>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading education:', error);
    }
}

async function loadContact() {
    try {
        const data = await fetch('data/contact.json').then(r => r.json());
        document.getElementById('contact-title').textContent = data.sectionTitle || 'Contact';
        document.getElementById('contact-subtitle').textContent = data.subtitle || '';
        const items = [];
        if (data.email) items.push(`<div class="contact-item"><i class="fas fa-envelope"></i> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>`);
        if (data.phone) items.push(`<div class="contact-item"><i class="fas fa-phone"></i> <a href="tel:${escapeHtml(data.phone.replace(/\s/g, ''))}">${escapeHtml(data.phone)}</a></div>`);
        if (data.location) items.push(`<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(data.location)}</div>`);
        if (data.availability) items.push(`<div class="contact-item contact-pill"><span class="status-dot"></span> ${escapeHtml(data.availability)}</div>`);
        document.getElementById('contact-info').innerHTML = items.join('');

        document.getElementById('contact-social').innerHTML = (data.socialLinks || []).map(link =>
            `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" class="social-link" aria-label="${escapeHtml(link.platform)}"><i class="${escapeHtml(link.icon)}"></i></a>`
        ).join('');
    } catch (error) {
        console.error('Error loading contact:', error);
    }
}

async function loadFooter() {
    try {
        const data = await fetch('data/footer.json').then(r => r.json());
        document.getElementById('footer-text').textContent = data.text || '';
        document.getElementById('footer-copyright').textContent = data.copyright || '';
        document.getElementById('footer-links').innerHTML = (data.links || []).map(link =>
            `<a href="${escapeHtml(link.url || link.href || '#')}" target="_blank" rel="noopener">${escapeHtml(link.text)}</a>`
        ).join('');
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// ----- behaviors -----
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

function initializeScrollEffects() {
    const sections = document.querySelectorAll('section');
    document.body.classList.add('js-ready');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });
    sections.forEach(section => observer.observe(section));
    // Safety net: mark everything visible after 1.5s if observer hasn't fired
    setTimeout(() => sections.forEach(s => s.classList.add('visible')), 1500);

    // Active nav link on scroll
    const navLinks = document.querySelectorAll('.nav-link');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => navObserver.observe(s));
}

function initializeBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initializeScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const update = () => {
        const h = document.documentElement;
        const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
        bar.style.width = `${scrolled}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

function initializeNavbarScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initializeTypewriter() {
    const target = document.getElementById('hero-title-text');
    if (!target) return;
    const text = target.dataset.text || '';
    if (!text) return;
    target.textContent = '';
    let i = 0;
    const speed = 70;
    const tick = () => {
        if (i <= text.length) {
            target.textContent = text.slice(0, i);
            i++;
            setTimeout(tick, speed);
        }
    };
    setTimeout(tick, 500);
}
