// =====================
// Netlify Identity Init
// =====================
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    updateAuthUI(user);
  });
  window.netlifyIdentity.on("login", user => {
    updateAuthUI(user);
    window.netlifyIdentity.close();
  });
  window.netlifyIdentity.on("logout", () => {
    updateAuthUI(null);
  });
  window.netlifyIdentity.init();
}

// Update Auth UI: show/hide buttons
function updateAuthUI(user) {
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");
  if (user) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// Auth button event listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn").addEventListener("click", () => {
    window.netlifyIdentity.open("login");
  });
  document.getElementById("signup-btn").addEventListener("click", () => {
    window.netlifyIdentity.open("signup");
  });
  document.getElementById("logout-btn").addEventListener("click", () => {
    window.netlifyIdentity.logout();
  });
});

// =====================
// Header Nav & Dropdown
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  dropdownToggles.forEach(btn => {
    btn.addEventListener("click", e => {
      const parent = btn.parentElement;
      parent.classList.toggle("open");
    });
  });

  // Responsive nav toggle
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  // Advanced Search toggle
  const advToggle = document.getElementById("advanced-search-toggle");
  const advSection = document.getElementById("advanced-search-section");
  const closeAdv = document.getElementById("close-adv-search");
  advToggle.addEventListener("click", e => {
    e.preventDefault();
    advSection.classList.remove("hidden");
  });
  closeAdv.addEventListener("click", () => {
    advSection.classList.add("hidden");
  });
  // Handle advanced search submit
  document.getElementById("advanced-search-form").addEventListener("submit", e => {
    e.preventDefault();
    const keyword = document.getElementById("adv-keyword").value.trim();
    const author = document.getElementById("adv-author").value.trim();
    const dateFrom = document.getElementById("adv-date-from").value;
    const dateTo = document.getElementById("adv-date-to").value;
    const section = document.getElementById("adv-section").value;
    // For demonstration, we filter local dummy articles. In real app, query backend.
    performAdvancedSearch({ keyword, author, dateFrom, dateTo, section });
    advSection.classList.add("hidden");
    // Show the "Latest Articles" section replaced by results
    hideAllSections();
    document.getElementById("latest-articles-section").classList.add("hidden");
  });

  // Section links
  document.getElementById("latest-articles-link").addEventListener("click", e => {
    e.preventDefault();
    showSection("latest-articles-section");
  });
  document.getElementById("most-read-link").addEventListener("click", e => {
    e.preventDefault();
    showSection("most-read-section");
  });
  document.getElementById("featured-link").addEventListener("click", e => {
    e.preventDefault();
    showSection("featured-section");
  });

  // Category dropdown items
  document.querySelectorAll('.dropdown-menu a[data-category]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const category = link.getAttribute("data-category");
      showCategory(category);
    });
  });
});

// =====================
// Dummy Articles Data
// =====================
// In real application, fetch from CMS or backend
const articles = [
  {
    id: 1,
    title: "Exploring Modern Literature",
    excerpt: "An overview of trends in modern literature...",
    author: "Alice Smith",
    date: "2025-05-10",
    category: "Literature",
    reads: 120,
    featured: true,
    imageUrl: "/images/article1.jpg"
  },
  {
    id: 2,
    title: "Philosophy in the 21st Century",
    excerpt: "How philosophy adapts to current challenges...",
    author: "Bob Johnson",
    date: "2025-04-22",
    category: "Philosophy",
    reads: 95,
    featured: false,
    imageUrl: "/images/article2.jpg"
  },
  {
    id: 3,
    title: "Advances in Quantum Science",
    excerpt: "Recent breakthroughs in quantum computing...",
    author: "Carol Lee",
    date: "2025-03-15",
    category: "Science",
    reads: 200,
    featured: true,
    imageUrl: "/images/article3.jpg"
  },
  // ... add more articles
];

// =====================
// Render Sections
// =====================
function hideAllSections() {
  document.querySelectorAll(".articles-section").forEach(sec => {
    sec.classList.add("hidden");
  });
}
function showSection(sectionId) {
  hideAllSections();
  document.getElementById(sectionId).classList.remove("hidden");
  // Populate if needed
  if (sectionId === "latest-articles-section") {
    renderLatestArticles();
  } else if (sectionId === "most-read-section") {
    renderMostRead();
  } else if (sectionId === "featured-section") {
    renderFeatured();
  }
}
function renderLatestArticles() {
  const container = document.getElementById("latest-articles-list");
  container.innerHTML = "";
  // Sort by date descending
  const sorted = [...articles].sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(article => {
    container.appendChild(createArticleCard(article));
  });
}
function renderMostRead() {
  const container = document.getElementById("most-read-list");
  container.innerHTML = "";
  const sorted = [...articles].sort((a,b) => b.reads - a.reads);
  sorted.forEach(article => {
    container.appendChild(createArticleCard(article));
  });
}
function renderFeatured() {
  const container = document.getElementById("featured-list");
  container.innerHTML = "";
  articles.filter(a => a.featured).forEach(article => {
    container.appendChild(createArticleCard(article));
  });
}
function showCategory(category) {
  hideAllSections();
  const section = document.getElementById("category-section");
  section.classList.remove("hidden");
  document.getElementById("category-title").textContent = `Category: ${category}`;
  const container = document.getElementById("category-list");
  container.innerHTML = "";
  articles.filter(a => a.category === category).forEach(article => {
    container.appendChild(createArticleCard(article));
  });
}

// Create an article card element
function createArticleCard(article) {
  const card = document.createElement("div");
  card.className = "article-card";
  // Optional image
  if (article.imageUrl) {
    const img = document.createElement("img");
    img.src = article.imageUrl;
    img.alt = article.title;
    card.appendChild(img);
  }
  const content = document.createElement("div");
  content.className = "article-card-content";
  content.innerHTML = `
    <h3>${article.title}</h3>
    <p>${article.excerpt}</p>
    <div class="meta">By ${article.author} | ${article.date}</div>
    <button class="read-more-btn" data-id="${article.id}">Read More</button>
  `;
  // Read More click: placeholder behavior
  content.querySelector(".read-more-btn").addEventListener("click", () => {
    alert(`Open article ID ${article.id} - implement detail view.`);
    // In real app, navigate to article detail page
  });
  card.appendChild(content);
  return card;
}

// On initial load, show Latest Articles
document.addEventListener("DOMContentLoaded", () => {
  showSection("latest-articles-section");
});

// =====================
// Advanced Search Logic (front-end filter of dummy data)
// =====================
function performAdvancedSearch({ keyword, author, dateFrom, dateTo, section }) {
  hideAllSections();
  const sectionEl = document.getElementById("category-section");
  sectionEl.classList.remove("hidden");
  document.getElementById("category-title").textContent = "Search Results";
  const container = document.getElementById("category-list");
  container.innerHTML = "";

  let results = [...articles];
  if (keyword) {
    const kw = keyword.toLowerCase();
    results = results.filter(a => a.title.toLowerCase().includes(kw) || a.excerpt.toLowerCase().includes(kw));
  }
  if (author) {
    const au = author.toLowerCase();
    results = results.filter(a => a.author.toLowerCase().includes(au));
  }
  if (dateFrom) {
    results = results.filter(a => new Date(a.date) >= new Date(dateFrom));
  }
  if (dateTo) {
    results = results.filter(a => new Date(a.date) <= new Date(dateTo));
  }
  if (section) {
    results = results.filter(a => a.category === section);
  }
  if (results.length === 0) {
    container.innerHTML = "<p>No articles found matching criteria.</p>";
  } else {
    results.forEach(article => {
      container.appendChild(createArticleCard(article));
    });
  }
}

// =====================
// Note on Subscriptions
// =====================
// You need to integrate a payment backend (e.g., Stripe) to handle subscriptions.
// Here we add a placeholder button in header when user is logged in.
document.addEventListener("DOMContentLoaded", () => {
  // After login, show “Subscribe” if needed
  const subscriptionBtn = document.createElement("button");
  subscriptionBtn.textContent = "Subscribe";
  subscriptionBtn.className = "auth-btn";
  subscriptionBtn.style.marginLeft = "0.5rem";
  subscriptionBtn.addEventListener("click", () => {
    alert("Subscription flow not implemented. Integrate your payment API here.");
    // e.g., redirect to Stripe Checkout or your subscription page
  });
  // Append when user is logged in
  window.netlifyIdentity.on("login", user => {
    document.querySelector(".auth-buttons").appendChild(subscriptionBtn);
  });
  window.netlifyIdentity.on("logout", () => {
    if (subscriptionBtn.parentElement) {
      subscriptionBtn.remove();
    }
  });
});

// =====================
// Retain previous features if needed:
// - Sidebar toggling (if you keep sidebar from earlier examples)
// - Semantic Scholar search (Netlify Functions) if you want to include that too.
// You can integrate performSearch() etc. as before.
// =====================

