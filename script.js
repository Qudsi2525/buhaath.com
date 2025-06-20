document.addEventListener('DOMContentLoaded', () => {
  const filterBtn = document.getElementById('filter-btn');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('close-filters');
  const searchBtn = document.getElementById('search-btn');
  const results = document.getElementById('results');

  filterBtn.addEventListener('click', () => {
    sidebar.style.right = '0';
  });

  closeBtn.addEventListener('click', () => {
    sidebar.style.right = '-320px';
  });

  document.getElementById('apply-filters').addEventListener('click', () => {
    sidebar.style.right = '-320px';
    search();
  });

  searchBtn.addEventListener('click', () => {
    search();
  });

  async function search() {
    const query = document.getElementById('query').value.trim();
    const year = document.getElementById('yearFilter').value;
    const field = document.getElementById('fieldFilter').value;
    const minCitations = parseInt(document.getElementById('citationsFilter').value) || 0;

    if (!query) {
      alert("Please enter a search term.");
      return;
    }

    searchBtn.textContent = "Searching...";
    searchBtn.disabled = true;
    results.innerHTML = "";

    try {
      const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=50&fields=title,abstract,authors,year,fieldsOfStudy,citationCount`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        results.innerHTML = "<p>No results found.</p>";
        return;
      }

      const filtered = data.data.filter(paper => {
        const citations = paper.citationCount || 0;
        const fieldMatch = !field || (paper.fieldsOfStudy && paper.fieldsOfStudy.includes(field));
        const yearMatch = !year || (paper.year >= new Date().getFullYear() - parseInt(year));
        return citations >= minCitations && fieldMatch && yearMatch;
      });

      filtered.forEach(paper => {
        const div = document.createElement('div');
        div.classList.add('result');
        div.innerHTML = `
          <h3><a href="https://www.semanticscholar.org/paper/${paper.paperId}" target="_blank">${paper.title}</a></h3>
          <p><strong>Authors:</strong> ${paper.authors.map(a => a.name).join(", ")}</p>
          <p><strong>Year:</strong> ${paper.year || 'N/A'}</p>
          <p><strong>Citations:</strong> ${paper.citationCount || 0}</p>
          <p><strong>Field:</strong> ${paper.fieldsOfStudy ? paper.fieldsOfStudy.join(", ") : 'N/A'}</p>
          <p><strong>Abstract:</strong> ${paper.abstract || "No abstract available."}</p>
        `;
        results.appendChild(div);
      });

    } catch (err) {
      results.innerHTML = "<p>Error loading results. Try again later.</p>";
    }

    searchBtn.textContent = "🔍 Search";
    searchBtn.disabled = false;
  }
});
