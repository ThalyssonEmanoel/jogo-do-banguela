const { createApp, ref, computed, onMounted, onBeforeUnmount, nextTick } = Vue;

createApp({
  setup() {
    const banguelaRef = ref(null);
    const cactoRef = ref(null);
    const rammusRef = ref(null);
    const bossRef = ref(null);
    const bolaFogoRef = ref(null);
    const isJumping = ref(false);
    const isDucking = ref(false);
    const currentScore = ref(0);
    const isGameOver = ref(false);
    const statusMessage = ref("");

    let collisionIntervalId = null;
    let jumpTimeoutId = null;
    let duckTimeoutId = null;
    let cactoSpawnTimeoutId = null;
    let rammusSpawnTimeoutId = null;
    let bolaFogoSpawnTimeoutId = null;

    const BASE_SPEED = 3000;
    const RAMMUS_SPEED_MULTIPLIER = 1.5;
    const BOLA_FOGO_SPEED_MULTIPLIER = 1.8;

    const scoreLabel = computed(() => `Recorde: ${currentScore.value}`);
    
    const shouldShowWarning = computed(() => 
      currentScore.value >= 3 && currentScore.value <= 5
    );
    
    const showBoss = computed(() => currentScore.value >= 20);
    
    // Velocidade aumenta 10% a cada 2 pontos
    const speedMultiplier = computed(() => 
      1 + Math.floor(currentScore.value / 2) * 0.1
    );
    
    const cactoSpeed = computed(() => 
      BASE_SPEED / speedMultiplier.value
    );
    
    const rammusSpeed = computed(() => 
      BASE_SPEED / (speedMultiplier.value * RAMMUS_SPEED_MULTIPLIER)
    );
    
    const bolaFogoSpeed = computed(() => 
      BASE_SPEED / (speedMultiplier.value * BOLA_FOGO_SPEED_MULTIPLIER)
    );

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
      const bolaFogoEl = bolaFogoRef.value;

      if (!banguelaEl || isGameOver.value) {
        return;
      }

      const banguelaBottom = parseInt(
        window.getComputedStyle(banguelaEl).getPropertyValue("bottom"),
        10
      );

      const checkObstacleCollision = (obstacleEl) => {
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

        // Se está abaixado, a altura é 25% da original (50px)
        // Bola de fogo tem altura ~60px, banguela abaixado ~50px
        if (isDucking.value) {
          // Quando abaixado, só colide se obstáculo estiver muito baixo
          return obstacleLeft > 40 && obstacleLeft < 150 && banguelaBottom <= 10;
        }
        
        // Colisão normal quando não está abaixado
        return obstacleLeft > 40 && obstacleLeft < 150 && banguelaBottom <= 0;
      };

      if (checkObstacleCollision(cactoEl) || 
          checkObstacleCollision(rammusEl) || 
          checkObstacleCollision(bolaFogoEl)) {
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
      
      // Spawna rammus entre 12 e 19 pontos
      if (currentScore.value < 12 || currentScore.value >= 20) return;
      
      const rammusEl = rammusRef.value;
      if (!rammusEl) return;
      
      rammusEl.classList.remove('active');
      rammusEl.style.animation = 'none';
      void rammusEl.offsetWidth;
      rammusEl.style.animation = `obstacle-move ${rammusSpeed.value}ms linear`;
      rammusEl.classList.add('active');
    };
    
    const spawnBolaFogo = () => {
      if (isGameOver.value || currentScore.value < 20) return;
      
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
      
      // Não spawna cacto se já passou de 12 pontos (só rammus)
      if (currentScore.value >= 12) return;
      
      if (cactoSpawnTimeoutId) {
        clearTimeout(cactoSpawnTimeoutId);
      }
      
      // Intervalo entre 500ms (0.5s) e 1000ms (1s)
      const randomDelay = Math.random() * 500 + 500;
      cactoSpawnTimeoutId = setTimeout(() => {
        spawnCacto();
      }, randomDelay);
    };
    
    const scheduleRammusSpawn = () => {
      if (isGameOver.value) return;
      
      // Spawna rammus entre 12 e 19 pontos
      if (currentScore.value < 12 || currentScore.value >= 20) return;
      
      if (rammusSpawnTimeoutId) {
        clearTimeout(rammusSpawnTimeoutId);
      }
      
      // Intervalo entre 500ms (0.5s) e 1000ms (1s)
      const randomDelay = Math.random() * 500 + 500;
      rammusSpawnTimeoutId = setTimeout(() => {
        spawnRammus();
      }, randomDelay);
    };
    
    const scheduleBolaFogoSpawn = () => {
      if (isGameOver.value || currentScore.value < 20) return;
      
      if (bolaFogoSpawnTimeoutId) {
        clearTimeout(bolaFogoSpawnTimeoutId);
      }
      
      // Intervalo aleatório entre 1.5s e 3s para bola de fogo
      const randomDelay = Math.random() * 1500 + 1500;
      bolaFogoSpawnTimeoutId = setTimeout(() => {
        spawnBolaFogo();
      }, randomDelay);
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

      if (cactoSpawnTimeoutId) {
        clearTimeout(cactoSpawnTimeoutId);
      }
      
      if (rammusSpawnTimeoutId) {
        clearTimeout(rammusSpawnTimeoutId);
      }
      
      if (bolaFogoSpawnTimeoutId) {
        clearTimeout(bolaFogoSpawnTimeoutId);
      }

      const cactoEl = cactoRef.value;
      if (cactoEl) {
        cactoEl.style.animationPlayState = "paused";
        cactoEl.classList.remove('active');
      }
      
      const rammusEl = rammusRef.value;
      if (rammusEl) {
        rammusEl.style.animationPlayState = "paused";
        rammusEl.classList.remove('active');
      }
      
      const bolaFogoEl = bolaFogoRef.value;
      if (bolaFogoEl) {
        bolaFogoEl.style.animationPlayState = "paused";
        bolaFogoEl.classList.remove('active');
      }
    };

    const jump = () => {
      if (isJumping.value || isGameOver.value || isDucking.value) {
        return;
      }

      isJumping.value = true;
      currentScore.value += 1;
      
      // Quando alcança exatamente 12 pontos, agenda transição para rammus
      if (currentScore.value === 12) {
        // Não cancela o cacto imediatamente, deixa terminar a animação
        // O rammus só começa depois que o cacto atual terminar
        // (controlado no event listener de animationend)
      }
      
      // Quando alcança 20 pontos, spawna o boss e bolas de fogo
      if (currentScore.value === 20) {
        // Não cancela o rammus imediatamente, deixa terminar a animação
        // A bola de fogo só começa depois que o rammus atual terminar
      }

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
    
    const duck = () => {
      if (isGameOver.value) {
        return;
      }
      
      // Se está pulando, aborta o pulo e cai imediatamente
      if (isJumping.value) {
        if (jumpTimeoutId) {
          window.clearTimeout(jumpTimeoutId);
        }
        isJumping.value = false;
        
        // Adiciona classe para animação de queda rápida
        const banguelaEl = banguelaRef.value;
        if (banguelaEl) {
          banguelaEl.classList.add('fast-fall');
          setTimeout(() => {
            banguelaEl.classList.remove('fast-fall');
          }, 200);
        }
        return;
      }
      
      // Se já está abaixado, ignora
      if (isDucking.value) {
        return;
      }
      
      isDucking.value = true;
      
      if (duckTimeoutId) {
        window.clearTimeout(duckTimeoutId);
      }
      
      // Fica abaixado por 500ms
      duckTimeoutId = window.setTimeout(() => {
        isDucking.value = false;
      }, 500);
    };

    const resetGame = () => {
      isGameOver.value = false;
      statusMessage.value = "";
      currentScore.value = 0;
      isDucking.value = false;
      
      if (cactoSpawnTimeoutId) {
        clearTimeout(cactoSpawnTimeoutId);
      }
      
      if (rammusSpawnTimeoutId) {
        clearTimeout(rammusSpawnTimeoutId);
      }
      
      if (bolaFogoSpawnTimeoutId) {
        clearTimeout(bolaFogoSpawnTimeoutId);
      }
      
      const cactoEl = cactoRef.value;
      if (cactoEl) {
        cactoEl.classList.remove('active');
        cactoEl.style.animation = 'none';
      }
      
      const rammusEl = rammusRef.value;
      if (rammusEl) {
        rammusEl.classList.remove('active');
        rammusEl.style.animation = 'none';
      }
      
      const bolaFogoEl = bolaFogoRef.value;
      if (bolaFogoEl) {
        bolaFogoEl.classList.remove('active');
        bolaFogoEl.style.animation = 'none';
      }
      
      startCollisionLoop();
      scheduleCactoSpawn();
    };

    const handleKeydown = (event) => {
      // Pular com seta para cima ou espaço
      if (event.code === "ArrowUp" || event.code === "Space") {
        if (isGameOver.value) {
          resetGame();
          nextTick(() => {
            jump();
          });
        } else {
          jump();
        }
      }
      
      // Abaixar com seta para baixo
      if (event.code === "ArrowDown") {
        if (!isGameOver.value) {
          duck();
        }
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleKeydown);
      statusMessage.value = "Pressione pular para começar.";
      startCollisionLoop();
      scheduleCactoSpawn();
      
      const cactoEl = cactoRef.value;
      const rammusEl = rammusRef.value;
      const bolaFogoEl = bolaFogoRef.value;
      
      if (cactoEl) {
        cactoEl.addEventListener('animationend', () => {
          cactoEl.classList.remove('active');
          // Se está abaixo de 12, continua spawnando cacto
          if (currentScore.value < 12 && !isGameOver.value) {
            scheduleCactoSpawn();
          }
          // Se chegou em 12, inicia o rammus após o cacto sair
          else if (currentScore.value === 12 && !isGameOver.value) {
            setTimeout(() => spawnRammus(), 200);
          }
        });
      }
      
      if (rammusEl) {
        rammusEl.addEventListener('animationend', () => {
          rammusEl.classList.remove('active');
          // Se está entre 12 e 19, continua spawnando rammus
          if (currentScore.value >= 12 && currentScore.value < 20 && !isGameOver.value) {
            scheduleRammusSpawn();
          }
          // Se chegou em 20, inicia a bola de fogo após o rammus sair
          else if (currentScore.value === 20 && !isGameOver.value) {
            setTimeout(() => spawnBolaFogo(), 200);
          }
        });
      }
      
      if (bolaFogoEl) {
        bolaFogoEl.addEventListener('animationend', () => {
          bolaFogoEl.classList.remove('active');
          if (currentScore.value >= 20 && !isGameOver.value) {
            scheduleBolaFogoSpawn();
          }
        });
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeydown);
      stopCollisionLoop();

      if (jumpTimeoutId) {
        window.clearTimeout(jumpTimeoutId);
      }
      
      if (duckTimeoutId) {
        window.clearTimeout(duckTimeoutId);
      }
      
      if (cactoSpawnTimeoutId) {
        clearTimeout(cactoSpawnTimeoutId);
      }
      
      if (rammusSpawnTimeoutId) {
        clearTimeout(rammusSpawnTimeoutId);
      }
      
      if (bolaFogoSpawnTimeoutId) {
        clearTimeout(bolaFogoSpawnTimeoutId);
      }
    });

    return {
      banguelaRef,
      cactoRef,
      rammusRef,
      bossRef,
      bolaFogoRef,
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
