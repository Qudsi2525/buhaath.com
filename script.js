// فتح/إغلاق الفلاتر
const sidebar = document.getElementById("sidebar");
document.getElementById("filter-btn").onclick = () => sidebar.classList.add("open");
document.getElementById("close-filters").onclick = () => sidebar.classList.remove("open");

// البحث مع تطبيق الفلاتر
document.getElementById("search-btn").onclick = async () => {
  const query = document.getElementById("query").value.trim();
  const year = document.getElementById("yearFilter").value;
  const field = document.getElementById("fieldFilter").value;
  const cites = document.getElementById("citationsFilter").value;

  if (!query) return alert("Please enter a search term.");

  sidebar.classList.remove("open");

  // تكوين رابط API
  let url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=50&fields=title,abstract,authors,year,url,fieldsOfStudy,citationCount`;
  const res = await fetch(url);
  const data = await res.json();

  let results = data.data || [];

  // تطبيق فلتر السنة
  if (year) {
    const minYear = new Date().getFullYear() - parseInt(year, 10) + 1;
    results = results.filter(p => p.year >= minYear);
  }

  // فلتر المجال
  if (field) {
    results = results.filter(p => p.fieldsOfStudy?.map(f=>f.toLowerCase()).includes(field));
  }

  // فلتر الاستشهادات
  if (cites) {
    results = results.filter(p => p.citationCount >= parseInt(cites, 10));
  }

  // عرض النتائج
  const container = document.getElementById("results");
  container.innerHTML = "";
  if (!results.length) {
    container.innerHTML = `<p>No results found.</p>`;
  } else {
    for (let paper of results) {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3><a href="${paper.url}" target="_blank">${paper.title}</a></h3>
        <p><strong>Authors:</strong> ${paper.authors.map(a => a.name).join(", ")}</p>
        <p><strong>Year:</strong> ${paper.year}</p>
        <p><strong>Citations:</strong> ${paper.citationCount}</p>
        <p>${paper.abstract || ""}</p>
      `;
      div.className = "result-item";
      container.appendChild(div);
    }
  }
};
