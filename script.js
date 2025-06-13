async function search() {
  const query = document.getElementById("query").value.trim();
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

  if (!data.data || data.data.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  data.data.forEach(paper => {
    const el = document.createElement("div");
    el.classList.add("result");
    el.innerHTML = `
      <h3>${paper.title}</h3>
      <p><strong>Authors:</strong> ${paper.authors.map(a => a.name).join(", ")}</p>
      <p><strong>Year:</strong> ${paper.year}</p>
      <a href="${paper.url}" target="_blank">View Full Paper</a>
    `;
    resultsDiv.appendChild(el);
  });
}
