// Initialize Netlify Identity
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => console.log('Netlify Identity initialized', user));
  window.netlifyIdentity.init();
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginBtn = document.getElementById('login-btn');
  const accountBtn = document.getElementById('account-btn');
  const subscriptionSection = document.getElementById('subscription-section');

  // Netlify Identity events
  function updateAuthUI(user) {
    if (user) {
      loginBtn.textContent = 'Log out';
      accountBtn.style.display = 'block';
      checkSubscription(user); // تحقق من حالة الاشتراك
    } else {
      loginBtn.textContent = 'Log in';
      accountBtn.style.display = 'none';
      subscriptionSection.style.display = 'none';
    }
  }
  // عند init
  const currentUser = netlifyIdentity.currentUser();
  updateAuthUI(currentUser);

  netlifyIdentity.on('login', user => {
    updateAuthUI(user);
    netlifyIdentity.close();
  });
  netlifyIdentity.on('logout', () => {
    updateAuthUI(null);
  });

  // Login button behavior
  loginBtn.addEventListener('click', () => {
    const user = netlifyIdentity.currentUser();
    if (user) {
      netlifyIdentity.logout();
    } else {
      netlifyIdentity.open('login');
    }
  });

  // Account button
  accountBtn.addEventListener('click', () => {
    netlifyIdentity.open('settings');
  });

  // Sidebar and dark mode etc. (كما سابق)
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const conversationsList = document.getElementById('conversations-list');
  const conversationSearch = document.getElementById('conversation-search');
  const body = document.body;

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
  });
  if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
  }

  // Conversations stub
  const conversations = [
    { id: 1, title: 'First chat', date: '2023-10-15' },
    { id: 2, title: 'Research discussion', date: '2023-10-14' },
    { id: 3, title: 'General questions', date: '2023-10-13' }
  ];
  conversations.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.innerHTML = `<div class="conv-title">${conv.title}</div><div class="conv-date">${conv.date}</div>`;
    item.addEventListener('click', () => {
      document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
    conversationsList.appendChild(item);
  });
  conversationSearch.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.conversation-item').forEach(item => {
      const title = item.querySelector('.conv-title').textContent.toLowerCase();
      item.style.display = title.includes(term) ? 'block' : 'none';
    });
  });
  document.addEventListener('click', e => {
    if (window.innerWidth <= 992 && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && e.target !== menuToggle) {
      sidebar.classList.remove('open');
    }
  });

  // Fill organized sections (مثال بيانات ثابتة؛ يمكنك تحميل JSON أو من CMS)
  const latestArticles = [
    { title: 'Article 1', excerpt: 'Excerpt 1', url: '/articles/1.html', section: 'literature', author: 'Author A', date: '2025-01-10', reads: 120 },
    { title: 'Article 2', excerpt: 'Excerpt 2', url: '/articles/2.html', section: 'science', author: 'Author B', date: '2025-02-05', reads: 95 }
    // ...
  ];
  const featuredArticles = [
    { title: 'Featured 1', excerpt: 'Feat Excerpt', url: '/articles/feat1.html', section: 'philosophy', author: 'Author C', date: '2024-12-20', reads: 200 }
    // ...
  ];
  function renderArticles(list, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    list.forEach(a => {
      const card = document.createElement('div');
      card.className = 'article-card';
      card.innerHTML = `
        <h3>${a.title}</h3>
        <p>${a.excerpt}</p>
        <p><small>${a.author} — ${a.date}</small></p>
        <a href="${a.url}" class="read-more">Read more</a>
      `;
      container.appendChild(card);
    });
  }
  // Render Latest sorted by date desc
  renderArticles(latestArticles.sort((a,b)=> new Date(b.date)-new Date(a.date)), 'latest-list');
  // Render Most Read sorted by reads desc
  renderArticles(latestArticles.sort((a,b)=> b.reads - a.reads), 'most-read-list');
  // Render featured
  renderArticles(featuredArticles, 'featured-list');

  // Advanced Search modal
  const advToggle = document.getElementById('advanced-search-toggle');
  const advModal = document.getElementById('advanced-search-modal');
  const advClose = document.getElementById('advanced-close');
  advToggle.addEventListener('click', e => {
    e.preventDefault();
    advModal.style.display = 'flex';
  });
  advClose.addEventListener('click', () => advModal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === advModal) advModal.style.display = 'none';
  });
  document.getElementById('adv-search-btn').addEventListener('click', () => {
    // اجمع قيم الفلتر المتقدم ثم نفذ بحث مناسب
    const author = document.getElementById('adv-author').value.trim().toLowerCase();
    const section = document.getElementById('adv-section').value;
    const dateFrom = document.getElementById('adv-date-from').value;
    const dateTo = document.getElementById('adv-date-to').value;
    // إذا البحث متقدم على المحتوى الداخلي:
    let filtered = latestArticles.concat(featuredArticles);
    if (author) filtered = filtered.filter(a=> a.author.toLowerCase().includes(author));
    if (section) filtered = filtered.filter(a=> a.section===section);
    if (dateFrom) filtered = filtered.filter(a=> new Date(a.date) >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter(a=> new Date(a.date) <= new Date(dateTo));
    // Render النتائج في قسم مخصص أو استبدل latest-list:
    renderArticles(filtered, 'latest-list');
    advModal.style.display = 'none';
  });

  // Search functionality (semantic scholar)
  let currentPage = 1;
  const limit = 20;
  document.getElementById('searchBtn').addEventListener('click', () => {
    currentPage = 1;
    performSearch();
  });
  async function performSearch() {
    const qRaw = document.getElementById("query").value.trim();
    if (!qRaw) { alert("Please enter a search query."); return; }
    const yearFrom = parseInt(document.getElementById("yearFrom").value);
    const yearTo = parseInt(document.getElementById("yearTo").value);
    const searchBtn = document.getElementById("searchBtn");
    const searchBtnText = document.getElementById("searchBtnText");
    const spinner = document.getElementById("spinner");
    // Save to history if تريد
    // Show loading
    searchBtnText.textContent = "Searching...";
    spinner.style.display = "inline-block";
    searchBtn.disabled = true;
    const query = encodeURIComponent(qRaw);
    const url = `/api/ss-search?q=${query}&limit=${limit}&page=${currentPage}`;
    const container = document.getElementById("results-container");
    const paginationEl = document.getElementById("pagination");
    const pageInfoEl = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    container.innerHTML = '';
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'message assistant';
    loadingMsg.innerHTML = '<div class="bubble">Searching...</div>';
    container.appendChild(loadingMsg);
    paginationEl.style.display = "none";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Server error");
      const json = await res.json();
      let data = json.data || [];
      if (!isNaN(yearFrom)) data = data.filter(p=>p.year && p.year>=yearFrom);
      if (!isNaN(yearTo)) data = data.filter(p=>p.year && p.year<=yearTo);
      container.innerHTML = '';
      if (data.length===0) {
        const msg = document.createElement('div');
        msg.className = 'message assistant first';
        msg.innerHTML = '<div class="bubble">No results found.</div>';
        container.appendChild(msg);
      } else {
        data.forEach((paper, idx) => {
          const msgDiv = document.createElement('div');
          msgDiv.className = 'message assistant' + (idx===0&&currentPage===1?' first':'');
          const authors = (paper.authors||[]).map(a=>a.name).join(", ");
          const titleEsc = paper.title.replace(/</g,"&lt;").replace(/>/g,"&gt;");
          const authorsEsc = authors.replace(/</g,"&lt;").replace(/>/g,"&gt;");
          const yearText = paper.year||'Unknown';
          msgDiv.innerHTML = `
            <div class="bubble">
              <a href="${paper.url}" target="_blank"><strong>${titleEsc}</strong></a><br>
              <small>${authorsEsc} — ${yearText}</small>
            </div>`;
          container.appendChild(msgDiv);
        });
      }
      const originalCount = (json.data||[]).length;
      prevBtn.disabled = currentPage<=1;
      nextBtn.disabled = originalCount<limit;
      pageInfoEl.textContent = `Page ${currentPage}`;
      paginationEl.style.display = "flex";
    } catch(err) {
      container.innerHTML = '';
      const errMsg = document.createElement('div');
      errMsg.className = 'message assistant first';
      errMsg.innerHTML = `<div class="bubble">Sorry, an error occurred. Please try again later.</div>`;
      container.appendChild(errMsg);
      console.error(err);
    } finally {
      searchBtnText.textContent = "Search";
      spinner.style.display = "none";
      searchBtn.disabled = false;
    }
  }
  window.prevPage = function() {
    if (currentPage>1) { currentPage--; performSearch(); }
  };
  window.nextPage = function() {
    currentPage++; performSearch();
  };

  // Subscription via Stripe
  const subscribeBtn = document.getElementById('subscribe-btn');
  subscribeBtn && subscribeBtn.addEventListener('click', async () => {
    const user = netlifyIdentity.currentUser();
    if (!user) {
      alert("Please log in first.");
      netlifyIdentity.open('login');
      return;
    }
    // Call Netlify Function to create Checkout session
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: user.email })
      });
      const { sessionId } = await res.json();
      const stripe = Stripe("{{STRIPE_PUBLISHABLE_KEY}}"); // استبدل بالمتغير أو اجلبه من env
      await stripe.redirectToCheckout({ sessionId });
    } catch(e) {
      console.error(e);
      alert("Subscription failed. Try again later.");
    }
  });
});

// تحقق من حالة الاشتراك (requires backend DB; مثال يستدعي دالة)
async function checkSubscription(user) {
  // نفترض دالة تحقّق في DB حالة الاشتراك للمستخدم
  try {
    const res = await fetch('/.netlify/functions/check-subscription', {
      headers: {
        Authorization: `Bearer ${user.token.access_token}`
      }
    });
    const data = await res.json();
    if (data.active) {
      document.getElementById('subscription-section').style.display = 'none';
      // ربما إظهار محتوى مميز
    } else {
      document.getElementById('subscription-section').style.display = 'block';
    }
  } catch(err) {
    console.error('Subscription check failed', err);
  }
}
