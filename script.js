document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const conversationsList = document.getElementById('conversations-list');
  const conversationSearch = document.getElementById('conversation-search');
  const body = document.body;

  // فتح/إغلاق الشريط في الشاشات الصغيرة
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // الوضع الليلي
  darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
  });
  if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
  }

  // بيانات محادثات نموذجية (يمكن استبدالها ببيانات فعلية)
  const conversations = [
    { id: 1, title: 'First chat', date: '2023-10-15' },
    { id: 2, title: 'Research discussion', date: '2023-10-14' },
    { id: 3, title: 'General questions', date: '2023-10-13' }
  ];

  // عرض قائمة المحادثات
  conversations.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.innerHTML = `
      <div class="conv-title">${conv.title}</div>
      <div class="conv-date">${conv.date}</div>
    `;
    item.addEventListener('click', () => {
      // تفعيل العنصر المحدد
      document.querySelectorAll('.conversation-item').forEach(el => {
        el.classList.remove('active');
      });
      item.classList.add('active');
      // هنا يمكن تحميل محتوى المحادثة في الواجهة
      console.log('Selected conversation:', conv.id);
    });
    conversationsList.appendChild(item);
  });

  // فلترة قائمة المحادثات أثناء الكتابة
  conversationSearch.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.conversation-item').forEach(item => {
      const title = item.querySelector('.conv-title').textContent.toLowerCase();
      item.style.display = title.includes(term) ? 'block' : 'none';
    });
  });

  // إغلاق الشريط عند النقر خارجَه في الشاشات الصغيرة
  document.addEventListener('click', e => {
    if (window.innerWidth <= 992 && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && e.target !== menuToggle) {
      sidebar.classList.remove('open');
    }
  });
});

// وظائف البحث في Semantic Scholar وعرض الفقاعة
let currentPage = 1;
const limit = 20;

function startSearch() {
  currentPage = 1;
  performSearch();
}

async function performSearch() {
  const qRaw = document.getElementById("query").value.trim();
  if (!qRaw) {
    alert("Please enter a search query.");
    return;
  }
  const yearFrom = parseInt(document.getElementById("yearFrom").value);
  const yearTo = parseInt(document.getElementById("yearTo").value);

  const query = encodeURIComponent(qRaw);
  const url = `/api/ss-search?q=${query}&limit=${limit}&page=${currentPage}`;
  const container = document.getElementById("results-container");
  const paginationEl = document.getElementById("pagination");
  const pageInfoEl = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // تعطيل الأزرار أثناء التحميل
  document.getElementById("searchBtn").disabled = true;
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  container.innerHTML = '';
  // عرض فقاعة تحميل
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

    // فلترة بالسنة client-side
    if (!isNaN(yearFrom)) {
      data = data.filter(p => p.year && p.year >= yearFrom);
    }
    if (!isNaN(yearTo)) {
      data = data.filter(p => p.year && p.year <= yearTo);
    }

    container.innerHTML = '';
    if (data.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'message assistant first';
      msg.innerHTML = '<div class="bubble">No results found.</div>';
      container.appendChild(msg);
    } else {
      data.forEach((paper, idx) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message assistant' + (idx === 0 && currentPage === 1 ? ' first' : '');
        const authors = (paper.authors || []).map(a => a.name).join(", ");
        const titleEsc = paper.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const authorsEsc = authors.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const yearText = paper.year || 'Unknown';
        msgDiv.innerHTML = `
          <div class="bubble">
            <a href="${paper.url}" target="_blank"><strong>${titleEsc}</strong></a><br>
            <small>${authorsEsc} — ${yearText}</small>
          </div>`;
        container.appendChild(msgDiv);
      });
    }

    // إعداد pagination
    const originalCount = (json.data || []).length;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = originalCount < limit;
    pageInfoEl.textContent = `Page ${currentPage}`;
    paginationEl.style.display = "flex";
  } catch (err) {
    container.innerHTML = '';
    const errMsg = document.createElement('div');
    errMsg.className = 'message assistant first';
    errMsg.innerHTML = `<div class="bubble">Error: ${err.message}</div>`;
    container.appendChild(errMsg);
  } finally {
    document.getElementById("searchBtn").disabled = false;
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    performSearch();
  }
}
function nextPage() {
  currentPage++;
  performSearch();
}
