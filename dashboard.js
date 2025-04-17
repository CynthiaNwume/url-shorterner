document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#urlTable tbody");
  
    // Load all URL data from backend
    fetch("http://127.0.0.1:5000/dashboard-data")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((url) => {
          const row = document.createElement("tr");
  
          row.innerHTML = `
            <td><a href="${url.original_url}" target="_blank">${url.original_url}</a></td>
            <td><a href="http://127.0.0.1:5000/${url.short_code}" target="_blank">${url.short_code}</a></td>
            <td>${url.clicks}</td>
            <td>${new Date(url.created_at).toLocaleString()}</td>
            <td><button class="delete-btn" onclick="deleteURL('${url.short_code}', this)">🗑️</button></td>
          `;
  
          tableBody.appendChild(row);
        });
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
      });
  });
  
  // Delete a short URL entry from the table and backend
  function deleteURL(shortCode, button) {
    if (!confirm("Are you sure you want to delete this URL?")) return;
  
    fetch(`http://127.0.0.1:5000/delete/${shortCode}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          const row = button.closest("tr");
          row.remove();
        } else {
          alert("❌ Failed to delete URL.");
        }
      })
      .catch(() => {
        alert("❌ Error deleting URL.");
      });
  }
  