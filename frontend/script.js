setInterval(() => {
  let now = new Date();

  time.innerText =
    "DATE " + now.toLocaleDateString() + "  TIME " + now.toLocaleTimeString();
}, 1000);


let interval;

function startDraw() {
  let digits = document.querySelectorAll(".digit");

  interval = setInterval(() => {
    digits.forEach((d) => {
      d.innerText = Math.floor(Math.random() * 10);
    });
  }, 50);

  setTimeout(stopDigits, 2500);
}

function stopDigits() {
  clearInterval(interval);

  let digits = document.querySelectorAll(".digit");

  let result = Math.floor(Math.random() * 15000)
    .toString()
    .padStart(5, "0");

  digits.forEach((d, i) => {
    setTimeout(() => {
      d.innerText = result[i];

      if (i == 4) {
        winnerName.innerText = "Winner Name";
      }
    }, i * 500);
  });
}

function redraw() {
  winnerName.innerText = "";
  startDraw();
}
