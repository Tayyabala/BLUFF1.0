const socket = io();

let myId = null;
let roomCode = null;
let hostId = null;
let latestRoom = null;

const $ = id => document.getElementById(id);
const screens = ["homeScreen","lobbyScreen","bluffScreen","voteScreen","resultsScreen","finalScreen"];

function showScreen(id) {
  screens.forEach(s => $(s).classList.toggle("active", s === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message) {
  const t = $("toast");
  t.textContent = message;
  t.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.add("hidden"), 2800);
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
  const initial = Array.from(name.trim())[0]?.toUpperCase() || "?";

  // Accetta solo i formati di colore generati dal server.
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

$("showJoinBtn").addEventListener("click", () => {
  $("joinBox").classList.toggle("hidden");
});

$("createBtn").addEventListener("click", () => {
  const name = $("nameInput").value.trim();
  const rounds = Number($("roundsSelect").value || 5);
  socket.emit("create_room", { name, totalRounds: rounds }, res => {
    if (!res?.ok) return toast(res?.error || "Errore.");
    myId = res.playerId;
    roomCode = res.code;
    $("bigCode").textContent = roomCode;
    $("roomBadge").textContent = roomCode;
    $("roomBadge").classList.remove("hidden");
    showScreen("lobbyScreen");
  });
});

$("joinBtn").addEventListener("click", () => {
  const name = $("nameInput").value.trim();
  const code = $("codeInput").value.trim().toUpperCase();
  socket.emit("join_room", { name, code }, res => {
    if (!res?.ok) return toast(res?.error || "Errore.");
    myId = res.playerId;
    roomCode = res.code;
    $("bigCode").textContent = roomCode;
    $("roomBadge").textContent = roomCode;
    $("roomBadge").classList.remove("hidden");
    showScreen("lobbyScreen");
  });
});

$("startBtn").addEventListener("click", () => {
  socket.emit("start_game", {}, res => {
    if (!res?.ok) toast(res?.error || "Impossibile iniziare.");
  });
});

$("submitBluffBtn").addEventListener("click", () => {
  const text = $("bluffInput").value.trim();
  socket.emit("submit_bluff", { text }, res => {
    if (!res?.ok) return toast(res?.error || "Errore.");
    $("submitBluffBtn").disabled = true;
    $("bluffInput").disabled = true;
    $("bluffWaiting").classList.remove("hidden");
  });
});

$("nextBtn").addEventListener("click", () => {
  socket.emit("next_round", {}, res => {
    if (!res?.ok) toast(res?.error || "Errore.");
  });
});

$("restartBtn").addEventListener("click", () => {
  socket.emit("restart_game", {}, res => {
    if (!res?.ok) toast(res?.error || "Errore.");
  });
});

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

socket.on("bluff_phase", data => {
  $("roundLabel").textContent = `Round ${data.roundNumber}/${data.totalRounds}`;
  $("questionText").textContent = data.question;
  $("bluffInput").value = "";
  $("bluffInput").disabled = false;
  $("submitBluffBtn").disabled = false;
  $("bluffWaiting").classList.add("hidden");
  $("submissionProgress").textContent = "Aspettando gli altri…";
  showScreen("bluffScreen");
});

socket.on("submission_progress", data => {
  $("submissionProgress").textContent = `${data.submitted}/${data.total} hanno risposto`;
});

socket.on("vote_phase", data => {
  $("voteQuestionText").textContent = data.question;
  $("voteWaiting").classList.add("hidden");
  $("voteProgress").textContent = "Aspettando gli altri…";

  $("optionsList").innerHTML = "";
  for (const option of data.options) {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option.text;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
      btn.classList.add("selected");

      socket.emit("submit_vote", { optionId: option.id }, res => {
        if (!res?.ok) {
          document.querySelectorAll(".option-btn").forEach(b => b.disabled = false);
          btn.classList.remove("selected");
          return toast(res?.error || "Errore.");
        }
        $("voteWaiting").classList.remove("hidden");
      });
    });
    $("optionsList").appendChild(btn);
  }

  showScreen("voteScreen");
});

socket.on("vote_progress", data => {
  $("voteProgress").textContent = `${data.voted}/${data.total} hanno votato`;
});

socket.on("round_results", data => {
  $("correctAnswerText").textContent = data.correctAnswer;

  // I punteggi contengono anche i colori assegnati dal server.
  if (latestRoom && Array.isArray(data.scores)) {
    latestRoom.players = data.scores;
  }

  $("resultOptions").innerHTML = data.options.map(o => {
    const author = o.isCorrect
      ? '<div class="result-author">Risposta corretta ✅</div>'
      : `
        <div class="result-author">
          <span>Bluff di:</span>
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
        <div class="result-text">${escapeHtml(o.text)}</div>

        <div class="result-meta">
          ${author}
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
  toast("Connessione persa. Ricarica la pagina se non si riconnette.");
});
