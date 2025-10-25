const { createApp, ref, computed, onMounted, onBeforeUnmount, nextTick } = Vue;

createApp({
  setup() {
    const banguelaRef = ref(null);
    const cactoRef = ref(null);
    const isJumping = ref(false);
    const currentScore = ref(0);
    const isGameOver = ref(false);
    const statusMessage = ref("");

    let collisionIntervalId = null;
    let jumpTimeoutId = null;

    const scoreLabel = computed(() => `Recorde: ${currentScore.value}`);

    const stopCollisionLoop = () => {
      if (collisionIntervalId) {
        window.clearInterval(collisionIntervalId);
        collisionIntervalId = null;
      }
    };

    const checkCollision = () => {
      const banguelaEl = banguelaRef.value;
      const cactoEl = cactoRef.value;

      if (!banguelaEl || !cactoEl || isJumping.value || isGameOver.value) {
        return;
      }

      const banguelaBottom = parseInt(
        window.getComputedStyle(banguelaEl).getPropertyValue("bottom"),
        10
      );
      const cactoLeft = parseInt(
        window.getComputedStyle(cactoEl).getPropertyValue("left"),
        10
      );

      if (Number.isNaN(banguelaBottom) || Number.isNaN(cactoLeft)) {
        return;
      }

      if (cactoLeft > 40 && cactoLeft < 150 && banguelaBottom <= 0) {
        handleGameOver();
      }
    };

    const startCollisionLoop = () => {
      if (!collisionIntervalId) {
        collisionIntervalId = window.setInterval(checkCollision, 10);
      }
    };

    const resetCactoAnimation = () => {
      const cactoEl = cactoRef.value;
      if (!cactoEl) {
        return;
      }

      cactoEl.style.animationPlayState = "paused";
      cactoEl.style.animation = "none";
      void cactoEl.offsetWidth;
      cactoEl.style.animation = "";
      cactoEl.style.animationPlayState = "running";
    };

    const handleGameOver = () => {
      isGameOver.value = true;
      statusMessage.value = `Banguela faleceu... Seu recorde foi: ${currentScore.value}`;
      currentScore.value = 0;
      stopCollisionLoop();

      const cactoEl = cactoRef.value;
      if (cactoEl) {
        cactoEl.style.animationPlayState = "paused";
      }
    };

    const jump = () => {
      if (isJumping.value || isGameOver.value) {
        return;
      }

      isJumping.value = true;
      currentScore.value += 1;

      if (statusMessage.value) {
        statusMessage.value = "";
      }

      if (jumpTimeoutId) {
        window.clearTimeout(jumpTimeoutId);
      }

      jumpTimeoutId = window.setTimeout(() => {
        isJumping.value = false;
      }, 1100);
    };

    const resetGame = () => {
      isGameOver.value = false;
      statusMessage.value = "";
      resetCactoAnimation();
      startCollisionLoop();
    };

    const handleKeydown = (event) => {
      if (event.code !== "ArrowUp" && event.code !== "Space") {
        return;
      }

      if (isGameOver.value) {
        resetGame();
        nextTick(() => {
          jump();
        });
      } else {
        jump();
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleKeydown);
      statusMessage.value = "Pressione pular para começar.";
      startCollisionLoop();
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeydown);
      stopCollisionLoop();

      if (jumpTimeoutId) {
        window.clearTimeout(jumpTimeoutId);
      }
    });

    return {
      banguelaRef,
      cactoRef,
      isJumping,
      scoreLabel,
      resetGame,
      isGameOver,
      statusMessage,
    };
  },
}).mount("#app");
