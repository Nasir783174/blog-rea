// ── CONFIG ─────────────────────────────────────
// Category গুলো এখানে define করো
// folder name → display name
const CATEGORIES = {
  travel:     'Travel',
  technology: 'Technology',
  food:       'Food',
  lifestyle:  'Lifestyle',
};

// Blog posts এর list (নতুন post upload করলে এখানে add করো)
// path: blogs/ ফোল্ডারের relative path
// category: উপরের CATEGORIES এর key
const POSTS = [
  // Example entries — তোমার post upload করার পর এখানে add করো:
   {
     path: 'blogs/travel/demo-post.html',
     title: 'My First Trip to Bali',
    excerpt: 'A short description of the post...',
     date: '2025-01-15',
     category: 'travel',
   },
{
     path: 'blogs/travel/demo.html',
     title: 'My First Trip to Bali',
    excerpt: 'A short description of the post...',
     date: '2025-01-15',
     category: 'travel',
   },
];

// ── SITE NAME ──────────────────────────────────
const SITE_NAME = 'Inkwell';
const SITE_TAGLINE = 'Stories worth reading.';

// ──────────────────────────────────────────────

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isIndex = currentPage === 'index.html' || currentPage === '';
const isBlog  = currentPage === 'blog.html';

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  buildHamburger();
  if (isIndex) initIndex();
  if (isBlog)  initBlog();
});

// ── NAV ────────────────────────────────────────
function buildNav() {
  const nav = document.getElementById('main-nav');
  const mobileNav = document.getElementById('mobile-nav');
  if (!nav) return;

  const params = new URLSearchParams(window.location.search);
  const active = params.get('category') || '';

  const allLink = isIndex
    ? `<a href="index.html" class="${!active && isIndex ? 'active' : ''}">All</a>`
    : `<a href="index.html">All</a>`;

  const catLinks = Object.entries(CATEGORIES).map(([key, name]) =>
    `<a href="index.html?category=${key}" class="${active === key ? 'active' : ''}">${name}</a>`
  ).join('');

  nav.innerHTML = allLink + catLinks;
  if (mobileNav) mobileNav.innerHTML = allLink + catLinks;
}

function buildHamburger() {
  const btn = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!btn || !mobileNav) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
}

// ── INDEX PAGE ─────────────────────────────────
function initIndex() {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const filterCat = params.get('category') || '';

  const filtered = filterCat
    ? POSTS.filter(p => p.category === filterCat)
    : POSTS;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No posts yet</h3>
        <p>${filterCat ? `No posts in "${CATEGORIES[filterCat] || filterCat}" yet.` : 'Upload your first blog post to get started.'}</p>
      </div>`;
    return;
  }

  // Sort by date descending (newest first)
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  grid.innerHTML = sorted.map(post => `
    <a href="${post.path}" class="card">
      <div class="card-category">${CATEGORIES[post.category] || post.category}</div>
      <div class="card-title">${post.title}</div>
      <div class="card-excerpt">${post.excerpt}</div>
      <div class="card-date">${formatDate(post.date)}</div>
      <span class="card-arrow">↗</span>
    </a>
  `).join('');
}

// ── BLOG POST PAGE ─────────────────────────────
function initBlog() {
  const params   = new URLSearchParams(window.location.search);
  const postPath = params.get('post');
  if (!postPath) return;

  const post = POSTS.find(p => p.path === postPath);
  if (!post) return;

  // Set page title
  document.title = `${post.title} — ${SITE_NAME}`;

  // Set breadcrumb category
  const catEl = document.getElementById('blog-category');
  if (catEl) {
    catEl.textContent = CATEGORIES[post.category] || post.category;
    catEl.href = `index.html?category=${post.category}`;
  }

  // Set meta
  const titleEl  = document.getElementById('blog-page-title');
  const dateEl   = document.getElementById('blog-date');
  if (titleEl) titleEl.textContent = post.title;
  if (dateEl)  dateEl.textContent  = formatDate(post.date);

  // Fetch and inject blog content
  const contentEl = document.getElementById('blog-content');
  if (!contentEl) return;

  fetch(postPath)
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc    = parser.parseFromString(html, 'text/html');
      const blogDiv = doc.querySelector('.blog');
      if (blogDiv) {
        contentEl.innerHTML = blogDiv.innerHTML;
      } else {
        contentEl.innerHTML = doc.body.innerHTML;
      }
    })
    .catch(() => {
      contentEl.innerHTML = '<p style="color:var(--text3)">Post could not be loaded.</p>';
    });
}

// ── HELPERS ────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
