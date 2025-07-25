<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BuhaaTh</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #fff;
      color: #333;
      margin: 0;
      padding: 0;
      text-align: center;
    }

    .search-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 30px;
      border-radius: 20px;
      background: #f5f5f5;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .search-container input {
      width: 80%;
      padding: 14px;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 10px;
    }

    .search-container button {
      padding: 14px 20px;
      font-size: 1rem;
      border-radius: 10px;
      background-color: #7C4DFF;
      color: #fff;
      border: none;
      cursor: pointer;
      margin-top: 12px;
    }

    .filters {
      margin: 20px auto;
      max-width: 800px;
    }

    .filters select, .filters input {
      padding: 12px;
      margin: 5px;
      border-radius: 10px;
      border: 1px solid #ccc;
      font-size: 14px;
    }

    #results {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 10px;
      text-align: left;
    }

    .result {
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 20px;
    }

    .result a {
      color: #7C4DFF;
      text-decoration: none;
    }

    .result a.button-link {
      display: inline-block;
      margin-top: 10px;
      color: white;
      background: #7C4DFF;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <div class="search-container">
    <h2>🔍 BuhaaTh Research Search</h2>
    <input type="text" id="query" placeholder="Enter your research topic..." />
    <br>
    <button id="search-btn">🔍 Search</button>
  </div>

  <div class="filters">
    <select id="fieldFilter">
      <option value="">All Fields</option>
      <option value="Medicine">Medicine</option>
      <option value="Biology">Biology</option>
      <option value="Computer Science">Computer Science</option>
      <option value="Engineering">Engineering</option>
      <option value="Chemistry">Chemistry</option>
      <option value="Physics">Physics</option>
    </select>

    <input type="number" id="citationsFilter" placeholder="Min Citations" />
    <input type="number" id="yearFilter" placeholder="Published within (years)" />
    <button id="apply-filters">Apply Filters</button>
  </div>

  <div id="results"></div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const searchBtn = document.getElementById('search-btn');
      const results = document.getElementById('results');

      document.getElementById('apply-filters').addEventListener('click', () => {
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
          const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=50&fields=title,abstract,authors,year,fieldsOfStudy,citationCount,paperId`;
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
            const div = document.createElement("div");
            div.className = "result";
            div.innerHTML = `
              <h3><a href="https://www.semanticscholar.org/paper/${paper.paperId}" target="_blank">${paper.title}</a></h3>
              <p><strong>Authors:</strong> ${paper.authors.map(a => a.name).join(", ")}</p>
              <p><strong>Year:</strong> ${paper.year || 'N/A'}</p>
              <p><strong>Citations:</strong> ${paper.citationCount || 0}</p>
              <p><strong>Field:</strong> ${paper.fieldsOfStudy ? paper.fieldsOfStudy.join(", ") : 'N/A'}</p>
              <p><strong>Abstract:</strong> ${paper.abstract || "No abstract available."}</p>
              <a href="https://www.semanticscholar.org/paper/${paper.paperId}" target="_blank" class="button-link">🔗 View Full Paper</a>
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
  </script>

</body>
</html>
