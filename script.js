async function search() {
  const query = document.getElementById("query").value.trim();
  const year = document.getElementById("filter-year").value.trim();
  const author = document.getElementById("filter-author").value.trim();

  if (!query) {
    alert("Please enter a search query.");
    return;
  }

  const response = await fetch(
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,url`
  );

  const data = await response.json();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const filteredPapers = data.data.filter(paper => {
    const matchesYear = year ? paper.year == year : true;
    const matchesAuthor = author ? paper.authors.some(a => a.name.toLowerCase().includes(author.toLowerCase())) : true;
    return matchesYear && matchesAuthor;
  });

  if (filteredPapers.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  filteredPapers.forEach(paper => {
    const el = document.createElement("div");
    el.classList.add("bubble");
    el.innerHTML = `
      <h3>${paper.title}</h3>
      <p><strong>Authors:</strong> ${paper.authors.map(a => a.name).join(", ")}</p>
      <p><strong>Year:</strong> ${paper.year}</p>
      <a href="${paper.url}" target="_blank">View Full Paper</a>
    `;
    resultsDiv.appendChild(el);
  });
}

document.getElementById("advanced-search-btn").onclick = () => {
  const filters = document.getElementById("advanced-filters");
  filters.style.display = filters.style.display === "none" ? "block" : "none";
};
