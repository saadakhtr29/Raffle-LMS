const API_BASE = "http://localhost:5500/api";

let activePrizeId = null;

setInterval(() => {
  let now = new Date();
  const timeEl = document.getElementById("time");
  if (timeEl) {
    timeEl.innerText =
      "DATE " + now.toLocaleDateString() + "  TIME " + now.toLocaleTimeString();
  }
}, 1000);

// Fetch a random prize to show BEFORE the draw
async function fetchNextPrize() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch(`${API_BASE}/prizes/random`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const prize = await res.json();
            activePrizeId = prize.id;
            document.querySelector('.prize').innerText = `Prize: ${prize.name}`;
        } else {
            document.querySelector('.prize').innerText = "Prize: No active prizes available";
            activePrizeId = null;
        }
    } catch (err) {
        console.error("Failed to load random prize", err);
        document.querySelector('.prize').innerText = "Prize: Error loading";
    }
}

window.addEventListener('DOMContentLoaded', fetchNextPrize);

let interval;
let isDrawing = false;
let currentWinner = null;

async function startDraw() {
  if (isDrawing) return;
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please login as Admin first via admin.html");
    return;
  }

  // Visual start
  isDrawing = true;
  currentWinner = null;
  const digits = document.querySelectorAll(".digit");
  const winnerNameEl = document.getElementById("winnerName");
  winnerNameEl.innerText = "";
  // Keep the prize visible that was already there or show "Locked in"
  const prizeLabel = document.querySelector('.prize').innerText;
  document.querySelector('.prize').innerText = `${prizeLabel}`;

  interval = setInterval(() => {
    digits.forEach((d) => {
      d.innerText = Math.floor(Math.random() * 10);
    });
  }, 50);

  try {
    const response = await fetch(`${API_BASE}/draw/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prizeId: activePrizeId // Use the ID we showed before the draw
      })
    });

    const data = await response.json();
    if (response.ok) {
      currentWinner = data;
      setTimeout(() => stopDigits(data), 2000);
    } else {
      clearInterval(interval);
      isDrawing = false;
      alert(data.error || "Draw failed");
      fetchNextPrize(); // Refresh prize if failed
    }
  } catch (error) {
    clearInterval(interval);
    isDrawing = false;
    alert("Connection error: " + error.message);
  }
}

function stopDigits(winnerData) {
  clearInterval(interval);

  const digits = document.querySelectorAll(".digit");
  const result = String(winnerData.ticketNumber).padStart(5, "0");

  digits.forEach((d, i) => {
    setTimeout(() => {
      d.innerText = result[i];

      if (i === digits.length - 1) {
        const winnerNameEl = document.getElementById("winnerName");
        winnerNameEl.innerText = winnerData.name;
        
        // Visual feedback for No Winner
        if (!winnerData.winnerFound) {
            winnerNameEl.style.color = "#ff4d4d"; // Red for no winner
        } else {
            winnerNameEl.style.color = "#fff"; // Default for winner
        }

        document.querySelector('.prize').innerText = `Prize: ${winnerData.prizeName}`;
        isDrawing = false;
      }
    }, i * 500);
  });
}

async function saveResult() {
  if (!currentWinner) {
    alert("No winner to save. Please perform a draw first.");
    return;
  }

  const shouldRemove = document.getElementById('remove-name-cb').checked;
  const token = localStorage.getItem('token');

  try {
    if (shouldRemove && currentWinner.ticketId) {
      const res = await fetch(`${API_BASE}/draw/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ticketId: currentWinner.ticketId })
      });

      if (!res.ok) {
        const data = await res.json();
        alert("Error removing ticket: " + (data.error || "Unknown error"));
        return;
      }
    }
    
    alert("Result saved successfully.");
    
    // Auto reset and FETCH NEXT PRIZE
    setTimeout(() => {
        const digits = document.querySelectorAll(".digit");
        digits.forEach(d => d.innerText = "0");
        document.getElementById("winnerName").innerText = "";
        currentWinner = null;
        fetchNextPrize(); // SHOW NEXT PRIZE IMMEDIATELY
    }, 1500);

  } catch (error) {
    alert("Failed to communicate with server: " + error.message);
  }
}
