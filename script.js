async function search() {
  const query = document.getElementById("query").value.trim();
  const loader = document.getElementById("loader");
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!query) {
    alert("Please enter a search query.");
    return;
  }

  loader.style.display = "block";

  try {
    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=25&fields=title,authors,year,url,abstract`
    );
    const data = await response.json();
    loader.style.display = "none";

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
        ${paper.abstract ? `<p><strong>Summary:</strong> ${paper.abstract}</p>` : `<p><em>No summary available.</em></p>`}
        <a href="${paper.url}" target="_blank">View Full Paper</a>
      `;
      resultsDiv.appendChild(el);
    });
  } catch (err) {
    loader.style.display = "none";
    resultsDiv.innerHTML = `<p style="color:red;">Error fetching results. Please try again later.</p>`;
  }
}
