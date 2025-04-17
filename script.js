let currentShortCode = ""; // Store the shortcode globally


async function shortenURL() {
    const longUrl = document.getElementById("longUrl").value;
    const resultDiv = document.getElementById("result");
    const statsBtn = document.getElementById("statsBtn");
    const statsDiv = document.getElementById("stats");
  
    resultDiv.innerHTML = "";
    statsDiv.innerHTML = "";
    statsBtn.style.display = "none";
  
    if (!longUrl) {
      resultDiv.innerHTML = `<p class="error">⚠️ Please enter a URL.</p>`;
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: longUrl })
      });
  
      const data = await response.json();
  
      if (data.short_url) {
        const parts = data.short_url.split('/');
        currentShortCode = parts[parts.length - 1];
  
        resultDiv.innerHTML = `
          <p class="success fade-in">✅ Here's your shortened URL:</p>
          <div class="short-link">
            <a href="${data.short_url}" target="_blank" id="shortUrl">${data.short_url}</a>
            <button class="copy-btn" onclick="copyToClipboard()">📋 Copy</button>
          </div>
          <p id="copied" class="copied-msg" style="display: none;">✅ Link copied!</p>
        `;
  
        statsBtn.style.display = "inline-block";
      } else {
        resultDiv.innerHTML = `<p class="error">❌ Something went wrong. Try again.</p>`;
      }
  
    } catch (error) {
      resultDiv.innerHTML = `<p class="error">❌ Server error. Check Flask is running.</p>`;
    }
  }
  
  function copyToClipboard() {
    const shortUrl = document.getElementById("shortUrl").textContent;
    navigator.clipboard.writeText(shortUrl).then(() => {
      const copiedMsg = document.getElementById("copied");
      copiedMsg.style.display = "block";
      copiedMsg.classList.add("fade-in");
  
      setTimeout(() => {
        copiedMsg.classList.remove("fade-in");
        copiedMsg.style.display = "none";
      }, 2000);
    });
  }
  

async function checkStats() {
  const statsDiv = document.getElementById("stats");
  statsDiv.innerHTML = "⏳ Checking stats...";

  try {
    const response = await fetch(`http://127.0.0.1:5000/stats/${currentShortCode}`);
    const data = await response.json();

    if (data.clicks !== undefined) {
      statsDiv.innerHTML = `
        <p><strong>📌 Original URL:</strong> ${data.original_url}</p>
        <p><strong>📈 Clicks:</strong> ${data.clicks}</p>
        <p><strong>📅 Created:</strong> ${new Date(data.created_at).toLocaleString()}</p>
      `;
    } else {
      statsDiv.innerHTML = `<p class="error">❌ Could not find stats for this link.</p>`;
    }
  } catch (error) {
    statsDiv.innerHTML = `<p class="error">❌ Failed to fetch stats.</p>`;
  }
}
