const { createApp, ref, computed, onMounted, onBeforeUnmount, nextTick } = Vue;

createApp({
  setup() {
    const banguelaRef = ref(null);
    const cactoRef = ref(null);
    const rammusRef = ref(null);
    const passarinhoRef = ref(null);
    const bossRef = ref(null);
    const bolaFogoRef = ref(null);
    const projetilRef = ref(null);
    const isJumping = ref(false);
    const isDucking = ref(false);
    const currentScore = ref(0);
    const isGameOver = ref(false);
    const statusMessage = ref("");
    const isBossDefeated = ref(false);

    let collisionIntervalId = null;
    let jumpTimeoutId = null;
    let duckTimeoutId = null;
    let cactoSpawnTimeoutId = null;
    let rammusSpawnTimeoutId = null;
    let passarinhoSpawnTimeoutId = null;
    let bolaFogoSpawnTimeoutId = null;

    const bgMusic = new Audio('audio/Pokemon Black & White Music_ Driftveil City Music.mp3');
    bgMusic.loop = true;
    const bossMusic = new Audio('audio/Doom.mp3');
    bossMusic.loop = true;
    const playBgMusic = () => {
      bossMusic.pause();
      bossMusic.currentTime = 0;
      bgMusic.play().catch(e => console.log("Audio play failed", e));
    };
    const playBossMusic = () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      bossMusic.play().catch(e => console.log("Audio play failed", e));
    };
    const stopAllMusic = () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      bossMusic.pause();
      bossMusic.currentTime = 0;
    };
    const BASE_SPEED = 3000;
    const RAMMUS_SPEED_MULTIPLIER = 1.5;
    const PASSARINHO_SPEED_MULTIPLIER = 1.6;
    const BOLA_FOGO_SPEED_MULTIPLIER = 1.8;
    const scoreLabel = computed(() => `Recorde: ${currentScore.value}`);
    const shouldShowWarning = computed(() => 
      currentScore.value >= 3 && currentScore.value <= 5
    );
    const showBoss = computed(() => currentScore.value >= 20 && currentScore.value <= 40 && !isBossDefeated.value);
    const speedMultiplier = computed(() => 
      1 + Math.floor(currentScore.value / 2) * 0.1
    );
    
    const cactoSpeed = computed(() => BASE_SPEED / speedMultiplier.value);
    const rammusSpeed = computed(() => BASE_SPEED / (speedMultiplier.value * RAMMUS_SPEED_MULTIPLIER));
    const passarinhoSpeed = computed(() => BASE_SPEED / (speedMultiplier.value * PASSARINHO_SPEED_MULTIPLIER));
    const bolaFogoSpeed = computed(() => BASE_SPEED / (speedMultiplier.value * BOLA_FOGO_SPEED_MULTIPLIER));

    const stopCollisionLoop = () => {
      if (collisionIntervalId) {
        window.clearInterval(collisionIntervalId);
        collisionIntervalId = null;
      }
    };

    const checkCollision = () => {
      const banguelaEl = banguelaRef.value;
      const cactoEl = cactoRef.value;
      const rammusEl = rammusRef.value;
      const passarinhoEl = passarinhoRef.value;
      const bolaFogoEl = bolaFogoRef.value;

      if (!banguelaEl || isGameOver.value) {
        return;
      }

      const banguelaBottom = parseInt(
        window.getComputedStyle(banguelaEl).getPropertyValue("bottom"),
        10
      );

      const checkObstacleCollision = (obstacleEl, type) => {
        if (!obstacleEl || !obstacleEl.classList.contains('active')) {
          return false;
        }
        
        const obstacleLeft = parseInt(
          window.getComputedStyle(obstacleEl).getPropertyValue("left"),
          10
        );

        if (Number.isNaN(banguelaBottom) || Number.isNaN(obstacleLeft)) {
          return false;
        }

        if (type === 'passarinho') {
            if (isDucking.value) return false;
            return obstacleLeft > 40 && obstacleLeft < 150;
        }

        if (isDucking.value) {
          return obstacleLeft > 40 && obstacleLeft < 150 && banguelaBottom <= 10;
        }
        
        return obstacleLeft > 40 && obstacleLeft < 150 && banguelaBottom <= 0;
      };

      if (checkObstacleCollision(cactoEl, 'ground') || 
          checkObstacleCollision(rammusEl, 'ground') || 
          checkObstacleCollision(passarinhoEl, 'passarinho') ||
          checkObstacleCollision(bolaFogoEl, 'ground')) {
        handleGameOver();
      }
    };

    const startCollisionLoop = () => {
      if (!collisionIntervalId) {
        collisionIntervalId = window.setInterval(checkCollision, 10);
      }
    };

    const spawnCacto = () => {
      if (isGameOver.value) return;
      const cactoEl = cactoRef.value;
      if (!cactoEl) return;
      cactoEl.classList.remove('active');
      cactoEl.style.animation = 'none';
      void cactoEl.offsetWidth;
      cactoEl.style.animation = `obstacle-move ${cactoSpeed.value}ms linear`;
      cactoEl.classList.add('active');
    };
    
    const spawnRammus = () => {
      if (isGameOver.value) return;
      const rammusEl = rammusRef.value;
      if (!rammusEl) return;
      rammusEl.classList.remove('active');
      rammusEl.style.animation = 'none';
      void rammusEl.offsetWidth;
      rammusEl.style.animation = `obstacle-move ${rammusSpeed.value}ms linear`;
      rammusEl.classList.add('active');
    };

    const spawnPassarinho = () => {
      if (isGameOver.value) return;
      const passarinhoEl = passarinhoRef.value;
      if (!passarinhoEl) return;
      passarinhoEl.classList.remove('active');
      passarinhoEl.style.animation = 'none';
      void passarinhoEl.offsetWidth;
      passarinhoEl.style.animation = `obstacle-move ${passarinhoSpeed.value}ms linear`;
      passarinhoEl.classList.add('active');
    };
    
    const spawnBolaFogo = () => {
      if (isGameOver.value) return;
      const bolaFogoEl = bolaFogoRef.value;
      if (!bolaFogoEl) return;
      bolaFogoEl.classList.remove('active');
      bolaFogoEl.style.animation = 'none';
      void bolaFogoEl.offsetWidth;
      bolaFogoEl.style.animation = `obstacle-move ${bolaFogoSpeed.value}ms linear`;
      bolaFogoEl.classList.add('active');
    };
    
    const scheduleCactoSpawn = () => {
      if (isGameOver.value) return;
      if (cactoSpawnTimeoutId) clearTimeout(cactoSpawnTimeoutId);
      const randomDelay = Math.random() * 500 + 500;
      cactoSpawnTimeoutId = setTimeout(spawnCacto, randomDelay);
    };
    
    const scheduleRammusSpawn = () => {
      if (isGameOver.value) return;
      if (rammusSpawnTimeoutId) clearTimeout(rammusSpawnTimeoutId);
      const randomDelay = Math.random() * 500 + 500;
      rammusSpawnTimeoutId = setTimeout(spawnRammus, randomDelay);
    };

    const schedulePassarinhoSpawn = () => {
      if (isGameOver.value) return;
      if (passarinhoSpawnTimeoutId) clearTimeout(passarinhoSpawnTimeoutId);
      const randomDelay = Math.random() * 500 + 500;
      passarinhoSpawnTimeoutId = setTimeout(spawnPassarinho, randomDelay);
    };
    
    const scheduleBolaFogoSpawn = () => {
      if (isGameOver.value) return;
      if (bolaFogoSpawnTimeoutId) clearTimeout(bolaFogoSpawnTimeoutId);
      const randomDelay = Math.random() * 1500 + 1500;
      bolaFogoSpawnTimeoutId = setTimeout(spawnBolaFogo, randomDelay);
    };

    const scheduleRandomObstacle = () => {
        if (isGameOver.value) return;
        const obstacles = [spawnCacto, spawnRammus, spawnPassarinho];
        const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
        const randomDelay = Math.random() * 500 + 500;
        setTimeout(randomObstacle, randomDelay);
    };

    const triggerBossDefeat = () => {
        const projetilEl = projetilRef.value;
        if (!projetilEl) return;

        projetilEl.style.display = 'block';
        projetilEl.style.animation = 'projectile-move 1s linear forwards';

        projetilEl.addEventListener('animationend', () => {
            projetilEl.style.display = 'none';
            isBossDefeated.value = true;
            playBgMusic();
            scheduleRandomObstacle();
        }, { once: true });
    };

    const handleGameOver = () => {
      isGameOver.value = true;
      stopAllMusic();
      statusMessage.value = `Banguela faleceu... Seu recorde foi: ${currentScore.value}`;
      currentScore.value = 0;
      isBossDefeated.value = false;
      stopCollisionLoop();

      if (cactoSpawnTimeoutId) clearTimeout(cactoSpawnTimeoutId);
      if (rammusSpawnTimeoutId) clearTimeout(rammusSpawnTimeoutId);
      if (passarinhoSpawnTimeoutId) clearTimeout(passarinhoSpawnTimeoutId);
      if (bolaFogoSpawnTimeoutId) clearTimeout(bolaFogoSpawnTimeoutId);

      const resetEl = (el) => {
          if (el) {
              el.style.animationPlayState = "paused";
              el.classList.remove('active');
          }
      };

      resetEl(cactoRef.value);
      resetEl(rammusRef.value);
      resetEl(passarinhoRef.value);
      resetEl(bolaFogoRef.value);
      
      if (projetilRef.value) {
          projetilRef.value.style.display = 'none';
      }
    };

    const jump = () => {
      if (isJumping.value || isGameOver.value || isDucking.value) return;
      if (currentScore.value === 0 && bgMusic.paused && bossMusic.paused) playBgMusic();
      isJumping.value = true;
      if (statusMessage.value) statusMessage.value = "";
      if (jumpTimeoutId) window.clearTimeout(jumpTimeoutId);
      jumpTimeoutId = window.setTimeout(() => { isJumping.value = false; }, 1100);
    };

    const duck = () => {
      if (isGameOver.value) return;
      if (isJumping.value) {
        if (jumpTimeoutId) window.clearTimeout(jumpTimeoutId);
        isJumping.value = false;
        const banguelaEl = banguelaRef.value;
        if (banguelaEl) {
          banguelaEl.classList.add('fast-fall');
          setTimeout(() => banguelaEl.classList.remove('fast-fall'), 200);
        }
        return;
      }
      if (isDucking.value) return;
      isDucking.value = true;
      if (duckTimeoutId) window.clearTimeout(duckTimeoutId);
      duckTimeoutId = window.setTimeout(() => { isDucking.value = false; }, 500);
    };

    const resetGame = () => {
      isGameOver.value = false;
      statusMessage.value = "";
      currentScore.value = 0;
      isDucking.value = false;
      isBossDefeated.value = false;
      
      stopAllMusic();
      playBgMusic();
      
      if (cactoSpawnTimeoutId) clearTimeout(cactoSpawnTimeoutId);
      if (rammusSpawnTimeoutId) clearTimeout(rammusSpawnTimeoutId);
      if (passarinhoSpawnTimeoutId) clearTimeout(passarinhoSpawnTimeoutId);
      if (bolaFogoSpawnTimeoutId) clearTimeout(bolaFogoSpawnTimeoutId);
      
      const resetEl = (el) => {
          if (el) {
              el.classList.remove('active');
              el.style.animation = 'none';
          }
      };
      
      resetEl(cactoRef.value);
      resetEl(rammusRef.value);
      resetEl(passarinhoRef.value);
      resetEl(bolaFogoRef.value);
      
      startCollisionLoop();
      scheduleCactoSpawn();
    };

    const handleKeydown = (event) => {
      if (event.code === "ArrowUp" || event.code === "Space") {
        if (isGameOver.value) {
          resetGame();
          nextTick(() => jump());
        } else {
          jump();
        }
      }
      if (event.code === "ArrowDown") {
        if (!isGameOver.value) duck();
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleKeydown);
      statusMessage.value = "Pressione pular para começar.";
      startCollisionLoop();
      scheduleCactoSpawn();
      
      const cactoEl = cactoRef.value;
      const rammusEl = rammusRef.value;
      const passarinhoEl = passarinhoRef.value;
      const bolaFogoEl = bolaFogoRef.value;
      
      const handleObstacleEnd = (el, nextLogic) => {
          if (!isGameOver.value) {
              currentScore.value += 1;
              nextLogic();
          }
          el.classList.remove('active');
      };

      if (cactoEl) {
        cactoEl.addEventListener('animationend', () => {
            handleObstacleEnd(cactoEl, () => {
                if (currentScore.value < 12) scheduleCactoSpawn();
                else if (currentScore.value === 12) setTimeout(spawnRammus, 200);
                else if (currentScore.value > 40) scheduleRandomObstacle();
            });
        });
      }
      
      if (rammusEl) {
        rammusEl.addEventListener('animationend', () => {
            handleObstacleEnd(rammusEl, () => {
                if (currentScore.value === 20) playBossMusic();
                
                if (currentScore.value >= 12 && currentScore.value < 20) scheduleRammusSpawn();
                else if (currentScore.value === 20) setTimeout(spawnBolaFogo, 200);
                else if (currentScore.value > 40) scheduleRandomObstacle();
            });
        });
      }

      if (passarinhoEl) {
          passarinhoEl.addEventListener('animationend', () => {
              handleObstacleEnd(passarinhoEl, () => {
                  if (currentScore.value > 40) scheduleRandomObstacle();
              });
          });
      }
      
      if (bolaFogoEl) {
        bolaFogoEl.addEventListener('animationend', () => {
            handleObstacleEnd(bolaFogoEl, () => {
                if (currentScore.value < 40) scheduleBolaFogoSpawn();
                else if (currentScore.value === 40) triggerBossDefeat();
                else if (currentScore.value > 40) scheduleRandomObstacle();
            });
        });
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeydown);
      stopCollisionLoop();
      if (jumpTimeoutId) window.clearTimeout(jumpTimeoutId);
      if (duckTimeoutId) window.clearTimeout(duckTimeoutId);
      if (cactoSpawnTimeoutId) clearTimeout(cactoSpawnTimeoutId);
      if (rammusSpawnTimeoutId) clearTimeout(rammusSpawnTimeoutId);
      if (passarinhoSpawnTimeoutId) clearTimeout(passarinhoSpawnTimeoutId);
      if (bolaFogoSpawnTimeoutId) clearTimeout(bolaFogoSpawnTimeoutId);
    });

    return {
      banguelaRef,
      cactoRef,
      rammusRef,
      passarinhoRef,
      bossRef,
      bolaFogoRef,
      projetilRef,
      isJumping,
      isDucking,
      scoreLabel,
      resetGame,
      isGameOver,
      statusMessage,
      shouldShowWarning,
      showBoss,
    };
  },

}).mount("#app");
