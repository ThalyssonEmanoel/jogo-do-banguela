const banguela = document.querySelector(".banguela");
const cacto = document.querySelector(".cacto");
const score = document.querySelector(".score");
let alreadyJump = false;
let count = 0;

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowUp" || e.code === "Space") {
    jump();
  }
});

function jump() {
  if (!alreadyJump) {
    banguela.classList.add("jump");
    alreadyJump = true;
    
    count++;
    score.innerHTML = `Recorde: ${count}`;

    setTimeout(() => {
      banguela.classList.remove("jump");
      alreadyJump = false;
    }, 1100);
  }
}

setInterval(() => {
  let banguelaBottom = parseInt(
    window.getComputedStyle(banguela).getPropertyValue("bottom")
  );
  let cactoLeft = parseInt(
    window.getComputedStyle(cacto).getPropertyValue("left")
  );

  if (cactoLeft > 40 && cactoLeft < 150 && banguelaBottom <= 0 && !alreadyJump) {
    alert(`Banguela morreu! Seu recorde foi: ${count}`);
    count = 0;  // Resetar o score após a morte
    score.innerHTML = `Recorde: ${count}`;
  }
}, 10);
