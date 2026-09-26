const socket = io({
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000
});

let myId = null;
let roomCode = null;
let hostId = null;
let latestRoom = null;

const $ = id => document.getElementById(id);

const screens = [
  "homeScreen",
  "lobbyScreen",
  "bluffScreen",
  "voteScreen",
  "resultsScreen",
  "finalScreen"
];

function showScreen(id) {
  screens.forEach(s => $(s).classList.toggle("active", s === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message) {
  const t = $("toast");
  t.textContent = message;
  t.classList.remove("hidden");
  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    t.classList.add("hidden");
  }, 2800);
}

function isHost() {
  return myId && hostId === myId;
}

function updateHostUI() {
  $("hostControls").classList.toggle("hidden", !isHost());
  $("guestWaiting").classList.toggle("hidden", isHost());
  $("nextBtn").classList.toggle("hidden", !isHost());
  $("waitHostNext").classList.toggle("hidden", isHost());
  $("restartBtn").classList.toggle("hidden", !isHost());
  $("waitHostRestart").classList.toggle("hidden", isHost());
}

function findAvatarPlayer(player) {
  const reference = typeof player === "string"
    ? { name: player }
    : (player || {});

  const players = latestRoom?.players || [];

  return players.find(p =>
    reference.id
      ? p.id === reference.id
      : p.name === reference.name
  ) || reference;
}

function avatarHtml(player) {
  const p = findAvatarPlayer(player);
  const name = String(p.name || "Giocatore");

  const initial =
    Array.from(name.trim())[0]?.toUpperCase() || "?";

  const rawColor = String(p.color || "");

  const validColor =
    /^#[0-9a-f]{6}$/i.test(rawColor) ||
    /^hsl\(\d{1,3}(?:\.\d{1,3})?, 70%, 72%\)$/.test(rawColor);

  const color = validColor ? rawColor : "#CCCCCC";

  return `
    <span
      class="player-avatar"
      style="--avatar-color: ${color}"
      aria-hidden="true"
    >${escapeHtml(initial)}</span>
  `;
}

function playerChipHtml(player) {
  const p = findAvatarPlayer(player);
  const name = p.name || "Giocatore";

  return `
    <span class="avatar-chip" title="${escapeHtml(name)}">
      ${avatarHtml(p)}
      <span class="avatar-caption">${escapeHtml(name)}</span>
    </span>
  `;
}

function renderPlayers(players) {
  $("playerCount").textContent = players.length;

  $("playersList").innerHTML = players.map(p => `
    <div class="player-row">
      <div class="player-identity">
        ${avatarHtml(p)}

        <div class="player-label">
          <span class="player-name">${escapeHtml(p.name)}</span>
          ${p.id === hostId
            ? '<span class="host-chip">HOST</span>'
            : ""}
        </div>
      </div>

      <span aria-label="${p.connected ? "Connesso" : "Disconnesso"}">
        ${p.connected ? "●" : "○"}
      </span>
    </div>
  `).join("");
}

function renderScores(scores, targetId) {
  $(targetId).innerHTML = scores.map((p, i) => `
    <div class="score-row">
      <div class="player-identity">
        <span class="score-rank">${i + 1}</span>
        ${avatarHtml(p)}
        <span class="player-name">${escapeHtml(p.name)}</span>
      </div>

      <span class="score-num">${p.score}</span>
    </div>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// MEMORIA DELLA SESSIONE

const SESSION_KEY = "bluff.session.v1";

let savedSession = null;
let sessionReady = false;
let restoring = false;
let replaced = false;
let resumeTimer = null;
let currentRoundKey = null;

try {
  const value = JSON.parse(
    localStorage.getItem(SESSION_KEY) || "null"
  );

  if (
    value &&
    typeof value.code === "string" &&
    typeof value.playerId === "string" &&
    typeof value.token === "string"
  ) {
    savedSession = value;
  }
} catch {
  // Se la memoria del browser non è disponibile,
  // viene mostrato un avviso al primo accesso.
}

// AVVISO DI CONNESSIONE

const connectionBanner = document.createElement("div");

connectionBanner.setAttribute("role", "status");

connectionBanner.style.cssText =
  "position:sticky;top:0;z-index:1000;" +
  "padding:12px 16px;background:#27272e;color:#fff;" +
  "text-align:center;font:600 14px system-ui;display:none;";

document.body.prepend(connectionBanner);

function connectionMessage(message) {
  connectionBanner.textContent = message || "";
  connectionBanner.style.display = message ? "block" : "none";
}

function rememberSession(res) {
  savedSession = {
    code: res.code,
    playerId: res.playerId,
    token: res.token
  };

  myId = res.playerId;
  roomCode = res.code;
  sessionReady = true;

  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(savedSession)
    );

    connectionMessage("");
  } catch {
    connectionMessage(
      "Il browser non permette di salvare l'accesso: " +
      "il recupero dopo un refresh non è garantito."
    );
  }
}

function forgetSession() {
  savedSession = null;
  myId = null;
  roomCode = null;
  hostId = null;
  latestRoom = null;
  currentRoundKey = null;

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}

  $("roomBadge").classList.add("hidden");
  showScreen("homeScreen");
}

function resumeSession() {
  if (
    !socket.connected ||
    !savedSession ||
    restoring ||
    replaced
  ) {
    return;
  }

  clearTimeout(resumeTimer);
  restoring = true;
  sessionReady = false;

  connectionMessage("Rientro nella partita…");

  const connectionId = socket.id;

  socket.timeout(8000).emit(
    "resume_session",
    savedSession,
    (err, res) => {
      if (
        connectionId !== socket.id ||
        !socket.connected ||
        replaced
      ) {
        return;
      }

      restoring = false;

      if (err) {
        connectionMessage(
          "Il server non risponde. " +
          "Riprovo a recuperare la partita…"
        );

        resumeTimer = setTimeout(resumeSession, 3000);
        return;
      }

      if (!res?.ok) {
        if (
          res?.reason === "expired" ||
          res?.reason === "invalid"
        ) {
          forgetSession();
          sessionReady = true;
        }

        connectionMessage(
          res?.error || "Impossibile recuperare la partita."
        );

        return;
      }

      rememberSession(res);
      updateHostUI();
    }
  );
}

// Evita di accodare azioni mentre il giocatore è offline.
function gameEmit(event, data, callback) {
  if (!socket.connected || !sessionReady || replaced) {
    toast("Attendi la riconnessione prima di continuare.");
    return;
  }

  const connectionId = socket.id;

  socket.timeout(8000).emit(event, data, (err, res) => {
    if (
      !socket.connected ||
      socket.id !== connectionId ||
      replaced
    ) {
      return;
    }

    if (err) {
      toast(
        "Risposta del server non ricevuta. " +
        "Verifico lo stato della partita…"
      );

      if (savedSession) resumeSession();
      return;
    }

    callback(res);
  });
}

socket.on("connect", () => {
  restoring = false;

  if (replaced) return;

  if (savedSession) {
    resumeSession();
  } else {
    sessionReady = true;
    connectionMessage("");
  }
});

socket.on("connect_error", () => {
  sessionReady = false;

  connectionMessage(
    "Connessione al server non disponibile. " +
    "Riprovo automaticamente…"
  );
});

socket.on("session_replaced", () => {
  replaced = true;
  restoring = false;
  sessionReady = false;

  clearTimeout(resumeTimer);

  connectionMessage(
    "La partita è aperta in un'altra scheda. " +
    "Continua lì o ricarica questa pagina per rientrare qui."
  );
});

document.addEventListener("visibilitychange", () => {
  if (
    document.visibilityState !== "visible" ||
    replaced
  ) {
    return;
  }

  if (!socket.connected) {
    socket.connect();
  } else if (savedSession) {
    resumeSession();
  }
});

window.addEventListener("online", () => {
  if (!replaced && !socket.connected) {
    socket.connect();
  }
});

// PULSANTI

$("showJoinBtn").addEventListener("click", () => {
  $("joinBox").classList.toggle("hidden");
});

$("createBtn").addEventListener("click", () => {
  const name = $("nameInput").value.trim();
  const rounds = Number($("roundsSelect").value || 5);

  gameEmit(
    "create_room",
    { name, totalRounds: rounds },
    res => {
      if (!res?.ok) {
        return toast(res?.error || "Errore.");
      }

      rememberSession(res);

      $("bigCode").textContent = roomCode;
      $("roomBadge").textContent = roomCode;
      $("roomBadge").classList.remove("hidden");

      showScreen("lobbyScreen");
    }
  );
});

$("joinBtn").addEventListener("click", () => {
  const name = $("nameInput").value.trim();
  const code = $("codeInput").value.trim().toUpperCase();

  if (savedSession && code === savedSession.code) {
    return resumeSession();
  }

  gameEmit("join_room", { name, code }, res => {
    if (!res?.ok) {
      return toast(res?.error || "Errore.");
    }

    rememberSession(res);

    $("bigCode").textContent = roomCode;
    $("roomBadge").textContent = roomCode;
    $("roomBadge").classList.remove("hidden");

    showScreen("lobbyScreen");
  });
});

$("startBtn").addEventListener("click", () => {
  const totalRounds = Number($("roundsSelect").value || 5);

  gameEmit("start_game", { totalRounds }, res => {
    if (!res?.ok) {
      toast(res?.error || "Impossibile iniziare.");
    }
  });
});

$("submitBluffBtn").addEventListener("click", () => {
  const text = $("bluffInput").value.trim();

  gameEmit(
    "submit_bluff",
    { text, roundKey: currentRoundKey },
    res => {
      if (!res?.ok) {
        return toast(res?.error || "Errore.");
      }

      $("submitBluffBtn").disabled = true;
      $("bluffInput").disabled = true;
      $("bluffWaiting").classList.remove("hidden");
    }
  );
});

$("nextBtn").addEventListener("click", () => {
  gameEmit("next_round", {}, res => {
    if (!res?.ok) toast(res?.error || "Errore.");
  });
});

$("restartBtn").addEventListener("click", () => {
  gameEmit("restart_game", {}, res => {
    if (!res?.ok) toast(res?.error || "Errore.");
  });
});

// STATO DELLA STANZA

socket.on("room_state", state => {
  latestRoom = state;
  roomCode = state.code;
  hostId = state.hostId;

  $("bigCode").textContent = roomCode;
  $("roomBadge").textContent = roomCode;
  $("roomBadge").classList.remove("hidden");

  renderPlayers(state.players);
  updateHostUI();
});

// FASE DI SCRITTURA

socket.on("bluff_phase", data => {
  currentRoundKey = data.roundKey;

  $("roundLabel").textContent =
    `Round ${data.roundNumber}/${data.totalRounds}`;

  $("questionText").textContent = data.question;
  $("bluffInput").value = data.text || "";

  $("bluffInput").disabled = Boolean(data.submitted);
  $("submitBluffBtn").disabled = Boolean(data.submitted);

  $("bluffWaiting").classList.toggle(
    "hidden",
    !data.submitted
  );

  $("submissionProgress").textContent =
    "Aspettando gli altri…";

  showScreen("bluffScreen");
});

socket.on("submission_progress", data => {
  $("submissionProgress").textContent =
    `${data.submitted}/${data.total} hanno risposto`;
});

// FASE DI VOTO

socket.on("vote_phase", data => {
  currentRoundKey = data.roundKey;

  $("voteQuestionText").textContent = data.question;
  $("voteWaiting").classList.toggle("hidden", !data.voted);
  $("voteProgress").textContent = "Aspettando gli altri…";
  $("optionsList").innerHTML = "";

  for (const option of data.options) {
    const btn = document.createElement("button");

    btn.className = "option-btn";
    btn.textContent = option.text;
    btn.disabled = Boolean(data.voted);

    btn.classList.toggle(
      "selected",
      option.id === data.selectedOptionId
    );

    btn.addEventListener("click", () => {
      if (!socket.connected || !sessionReady || replaced) {
        return toast("Attendi la riconnessione.");
      }

      document.querySelectorAll(".option-btn").forEach(b => {
        b.disabled = true;
      });

      btn.classList.add("selected");

      gameEmit(
        "submit_vote",
        {
          optionId: option.id,
          roundKey: currentRoundKey
        },
        res => {
          if (!res?.ok) {
            document.querySelectorAll(".option-btn").forEach(b => {
              b.disabled = false;
            });

            btn.classList.remove("selected");
            return toast(res?.error || "Errore.");
          }

          $("voteWaiting").classList.remove("hidden");
        }
      );
    });

    $("optionsList").appendChild(btn);
  }

  showScreen("voteScreen");
});

socket.on("vote_progress", data => {
  $("voteProgress").textContent =
    `${data.voted}/${data.total} hanno votato`;
});

// RISULTATI: GRAFICA INVARIATA

socket.on("round_results", data => {
  $("correctAnswerText").textContent = data.correctAnswer;

  if (latestRoom && Array.isArray(data.scores)) {
    latestRoom.players = data.scores;
  }

  $("resultOptions").innerHTML = data.options.map(o => {
    const author = o.isCorrect
      ? `
        <div class="answer-correct-label">
          <span aria-hidden="true">✓</span>
          <span>Risposta corretta</span>
        </div>
      `
      : `
        <div class="answer-author">
          <span class="answer-author-label">Bluff di:</span>
          ${playerChipHtml(o.ownerName || "Giocatore")}
        </div>
      `;

    const votes = o.voters.length
      ? `
        <div class="result-votes">
          <span>Votata da:</span>

          <div class="voter-avatars">
            ${o.voters.map(name => playerChipHtml(name)).join("")}
          </div>
        </div>
      `
      : '<div class="result-votes">Nessun voto</div>';

    return `
      <div class="result-card ${o.isCorrect ? "correct" : "false"}">
        <div class="answer-header">
          <div class="result-text">${escapeHtml(o.text)}</div>
          ${author}
        </div>

        <div class="result-meta">
          ${votes}
        </div>
      </div>
    `;
  }).join("");

  renderScores(data.scores, "scoreboard");
  updateHostUI();
  showScreen("resultsScreen");
});

socket.on("game_over", data => {
  renderScores(data.scores, "finalScoreboard");
  updateHostUI();
  showScreen("finalScreen");
});

socket.on("back_to_lobby", () => {
  showScreen("lobbyScreen");
});

socket.on("disconnect", () => {
  sessionReady = false;
  restoring = false;

  clearTimeout(resumeTimer);

  if (!replaced) {
    connectionMessage(
      "Connessione interrotta. " +
      "Rientrerai automaticamente appena torna disponibile."
    );
  }
});
