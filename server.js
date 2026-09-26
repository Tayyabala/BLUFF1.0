const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

const QUESTION_BANK = [
  { q: "Qual è la capitale dell'Australia?", a: "Canberra" },
  { q: "Quale pianeta è conosciuto come il Pianeta Rosso?", a: "Marte" },
  { q: "Qual è l'elemento chimico con simbolo Au?", a: "Oro" },
  { q: "In quale città si trova la Sagrada Família?", a: "Barcellona" },
  { q: "Qual è il fiume più lungo d'Italia?", a: "Po" },
  { q: "Quale animale è il più grande mammifero vivente?", a: "Balenottera azzurra" },
  { q: "Chi ha scritto 'I Promessi Sposi'?", a: "Alessandro Manzoni" },
  { q: "Qual è la capitale del Canada?", a: "Ottawa" },
  { q: "Quale gas è più abbondante nell'atmosfera terrestre?", a: "Azoto" },
  { q: "In quale continente si trova il deserto del Sahara?", a: "Africa" },
  { q: "Quale oceano separa l'Europa dall'America?", a: "Oceano Atlantico" },
  { q: "Quale strumento misura la pressione atmosferica?", a: "Barometro" },
  { q: "Quale Paese ha come capitale Tokyo?", a: "Giappone" },
  { q: "Quanti lati ha un dodecagono?", a: "12" },
  { q: "Qual è la capitale della Nuova Zelanda?", a: "Wellington" },
  { q: "Chi dipinse la Gioconda?", a: "Leonardo da Vinci" },
  { q: "Quale metallo è liquido a temperatura ambiente?", a: "Mercurio" },
  { q: "Quale lingua ha il maggior numero di madrelingua al mondo?", a: "Cinese mandarino" },
  { q: "Qual è la montagna più alta del mondo sopra il livello del mare?", a: "Everest" },
  { q: "Qual è il simbolo chimico del sodio?", a: "Na" },
  { q: "Quale organo del corpo umano produce l'insulina?", a: "Pancreas" },
  { q: "Quale città è attraversata dal Tamigi?", a: "Londra" },
  { q: "Qual è la capitale dell'Argentina?", a: "Buenos Aires" },
  { q: "Quale pianeta ha gli anelli più visibili?", a: "Saturno" },
  { q: "Chi scrisse la Divina Commedia?", a: "Dante Alighieri" },
  { q: "Quale Paese europeo ha Lisbona come capitale?", a: "Portogallo" },
  { q: "Qual è l'osso più lungo del corpo umano?", a: "Femore" },
  { q: "Quale mare bagna la costa occidentale dell'Italia?", a: "Mar Tirreno" },
  { q: "Come si chiama il processo con cui le piante producono glucosio usando la luce?", a: "Fotosintesi" },
  { q: "Quale città ospita il Colosseo?", a: "Roma" },
  { q: "Qual è la capitale della Norvegia?", a: "Oslo" },
  { q: "Quale scienziato formulò le leggi del moto e della gravitazione universale?", a: "Isaac Newton" },
  { q: "Quante corde ha normalmente una chitarra classica?", a: "6" },
  { q: "Quale Paese ha la forma geografica spesso paragonata a uno stivale?", a: "Italia" },
  { q: "Quale vitamina viene sintetizzata dalla pelle con l'esposizione alla luce solare?", a: "Vitamina D" },
  { q: "Qual è la capitale della Finlandia?", a: "Helsinki" },
  { q: "Quale animale è simbolicamente associato all'Australia ed è noto per saltare?", a: "Canguro" },
  { q: "Quale artista dipinse 'La notte stellata'?", a: "Vincent van Gogh" },
  { q: "Qual è il nome del satellite naturale della Terra?", a: "Luna" },
  { q: "Quale Paese ha come capitale Atene?", a: "Grecia" },
  { q: "Qual è il numero atomico dell'idrogeno?", a: "1" },
  { q: "Qual è la capitale dell'Egitto?", a: "Il Cairo" },
  { q: "Quale strumento si usa per osservare oggetti molto piccoli?", a: "Microscopio" },
  { q: "Qual è la capitale dell'Islanda?", a: "Reykjavík" },
  { q: "Quale sport si gioca a Wimbledon?", a: "Tennis" },
  { q: "Chi è l'autore di 'Romeo e Giulietta'?", a: "William Shakespeare" },
  { q: "Quale continente contiene il maggior numero di Paesi?", a: "Africa" },
  { q: "Quale organo pompa il sangue nel corpo umano?", a: "Cuore" },
  { q: "Qual è la capitale della Thailandia?", a: "Bangkok" },
  { q: "Quale animale è noto per cambiare colore per mimetizzarsi?", a: "Camaleonte" }
];

const rooms = new Map();

function normalize(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = "";
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

function safeName(name) {
  return String(name || "").trim().slice(0, 18);
}

function publicPlayers(room) {
  return [...room.players.values()].map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    connected: p.connected
  }));
}

function broadcastRoom(room) {
  io.to(room.code).emit("room_state", {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    roundNumber: room.roundIndex + 1,
    totalRounds: room.totalRounds,
    players: publicPlayers(room)
  });
}

function activePlayers(room) {
  return [...room.players.values()].filter(p => p.connected);
}

function maybeAdvanceAfterSubmission(room) {
  const active = activePlayers(room);
  if (active.length >= 2 && active.every(p => room.submissions.has(p.id))) {
    buildVotingOptions(room);
  }
}

function buildVotingOptions(room) {
  const q = room.currentQuestion;
  const options = [{
    id: "correct",
    text: q.a,
    ownerId: null,
    isCorrect: true
  }];

  for (const [playerId, text] of room.submissions.entries()) {
    options.push({
      id: `bluff_${playerId}`,
      text,
      ownerId: playerId,
      isCorrect: false
    });
  }

  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  room.options = options;
  room.phase = "vote";

  for (const p of activePlayers(room)) {
    const visible = options
      .filter(o => o.ownerId !== p.id)
      .map(o => ({ id: o.id, text: o.text }));
    io.to(p.id).emit("vote_phase", {
      question: q.q,
      options: visible
    });
  }

  broadcastRoom(room);
}

function maybeReveal(room) {
  const active = activePlayers(room);
  if (active.length >= 2 && active.every(p => room.votes.has(p.id))) {
    scoreRound(room);
  }
}

function scoreRound(room) {
  const roundPoints = new Map();
  for (const p of room.players.values()) roundPoints.set(p.id, 0);

  for (const [voterId, optionId] of room.votes.entries()) {
    const option = room.options.find(o => o.id === optionId);
    if (!option) continue;

    if (option.isCorrect) {
      roundPoints.set(voterId, (roundPoints.get(voterId) || 0) + 2);
    } else if (option.ownerId && option.ownerId !== voterId) {
      roundPoints.set(option.ownerId, (roundPoints.get(option.ownerId) || 0) + 1);
    }
  }

  for (const [playerId, pts] of roundPoints.entries()) {
    const p = room.players.get(playerId);
    if (p) p.score += pts;
  }

  room.phase = "results";

  const optionResults = room.options.map(o => {
    const voters = [...room.votes.entries()]
      .filter(([, optionId]) => optionId === o.id)
      .map(([voterId]) => room.players.get(voterId)?.name)
      .filter(Boolean);

    return {
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
      ownerName: o.ownerId ? room.players.get(o.ownerId)?.name || "Giocatore" : null,
      voters
    };
  });

  io.to(room.code).emit("round_results", {
    question: room.currentQuestion.q,
    correctAnswer: room.currentQuestion.a,
    options: optionResults,
    roundPoints: [...roundPoints.entries()].map(([id, points]) => ({
      id,
      name: room.players.get(id)?.name || "Giocatore",
      points
    })),
    scores: publicPlayers(room).sort((a, b) => b.score - a.score)
  });

  broadcastRoom(room);
}

function startRound(room) {
  if (room.roundIndex >= room.totalRounds) {
    room.phase = "final";
    io.to(room.code).emit("game_over", {
      scores: publicPlayers(room).sort((a, b) => b.score - a.score)
    });
    broadcastRoom(room);
    return;
  }

  const qIndex = room.questionOrder[room.roundIndex];
  room.currentQuestion = QUESTION_BANK[qIndex];
  room.submissions = new Map();
  room.votes = new Map();
  room.options = [];
  room.phase = "bluff";

  io.to(room.code).emit("bluff_phase", {
    question: room.currentQuestion.q,
    roundNumber: room.roundIndex + 1,
    totalRounds: room.totalRounds
  });

  broadcastRoom(room);
}

function leaveRoom(socket) {
  const code = socket.data.roomCode;
  if (!code || !rooms.has(code)) return;
  const room = rooms.get(code);
  const player = room.players.get(socket.id);
  if (!player) return;

  if (room.phase === "lobby") {
    room.players.delete(socket.id);
    if (room.hostId === socket.id) {
      const next = room.players.values().next().value;
      room.hostId = next?.id || null;
    }
  } else {
    player.connected = false;
  }

  if (room.players.size === 0 || activePlayers(room).length === 0) {
    rooms.delete(code);
    return;
  }

  if (room.phase === "bluff") maybeAdvanceAfterSubmission(room);
  if (room.phase === "vote") maybeReveal(room);

  broadcastRoom(room);
}

io.on("connection", socket => {
  socket.on("create_room", ({ name, totalRounds }, cb) => {
    const clean = safeName(name);
    if (!clean) return cb?.({ ok: false, error: "Inserisci un nome." });

    const rounds = Math.min(10, Math.max(3, Number(totalRounds) || 5));
    const code = makeRoomCode();
    const questionOrder = [...Array(QUESTION_BANK.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, rounds);

    const room = {
      code,
      hostId: socket.id,
      phase: "lobby",
      roundIndex: 0,
      totalRounds: rounds,
      players: new Map(),
      submissions: new Map(),
      votes: new Map(),
      options: [],
      questionOrder,
      currentQuestion: null
    };

    room.players.set(socket.id, {
      id: socket.id,
      name: clean,
      score: 0,
      connected: true
    });

    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    cb?.({ ok: true, code, playerId: socket.id });
    broadcastRoom(room);
  });

  socket.on("join_room", ({ code, name }, cb) => {
    const room = rooms.get(String(code || "").trim().toUpperCase());
    const clean = safeName(name);

    if (!room) return cb?.({ ok: false, error: "Stanza non trovata." });
    if (room.phase !== "lobby") return cb?.({ ok: false, error: "La partita è già iniziata." });
    if (!clean) return cb?.({ ok: false, error: "Inserisci un nome." });

    const nameTaken = [...room.players.values()].some(
      p => normalize(p.name) === normalize(clean)
    );
    if (nameTaken) return cb?.({ ok: false, error: "Questo nome è già usato nella stanza." });

    room.players.set(socket.id, {
      id: socket.id,
      name: clean,
      score: 0,
      connected: true
    });

    socket.join(room.code);
    socket.data.roomCode = room.code;
    cb?.({ ok: true, code: room.code, playerId: socket.id });
    broadcastRoom(room);
  });

  socket.on("start_game", (_, cb) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) return cb?.({ ok: false, error: "Stanza non trovata." });
    if (room.hostId !== socket.id) return cb?.({ ok: false, error: "Solo l'host può iniziare." });
    if (activePlayers(room).length < 2) return cb?.({ ok: false, error: "Servono almeno 2 giocatori." });
    if (room.phase !== "lobby") return cb?.({ ok: false, error: "La partita è già iniziata." });

    room.roundIndex = 0;
    startRound(room);
    cb?.({ ok: true });
  });

  socket.on("submit_bluff", ({ text }, cb) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.phase !== "bluff") return cb?.({ ok: false, error: "Non puoi inviare una risposta ora." });

    const clean = String(text || "").trim().slice(0, 60);
    if (!clean) return cb?.({ ok: false, error: "Scrivi una risposta." });

    if (normalize(clean) === normalize(room.currentQuestion.a)) {
      return cb?.({ ok: false, error: "Questa è la risposta corretta 👀 Scrivi un bluff diverso." });
    }

    for (const [pid, existing] of room.submissions.entries()) {
      if (pid !== socket.id && normalize(existing) === normalize(clean)) {
        return cb?.({ ok: false, error: "Qualcuno ha già scritto una risposta uguale. Cambiala." });
      }
    }

    room.submissions.set(socket.id, clean);
    cb?.({ ok: true });
    io.to(room.code).emit("submission_progress", {
      submitted: room.submissions.size,
      total: activePlayers(room).length
    });

    maybeAdvanceAfterSubmission(room);
  });

  socket.on("submit_vote", ({ optionId }, cb) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.phase !== "vote") return cb?.({ ok: false, error: "Non puoi votare ora." });

    const option = room.options.find(o => o.id === optionId);
    if (!option) return cb?.({ ok: false, error: "Risposta non valida." });
    if (option.ownerId === socket.id) return cb?.({ ok: false, error: "Non puoi votare la tua risposta." });

    room.votes.set(socket.id, optionId);
    cb?.({ ok: true });
    io.to(room.code).emit("vote_progress", {
      voted: room.votes.size,
      total: activePlayers(room).length
    });

    maybeReveal(room);
  });

  socket.on("next_round", (_, cb) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) return cb?.({ ok: false, error: "Stanza non trovata." });
    if (room.hostId !== socket.id) return cb?.({ ok: false, error: "Solo l'host può continuare." });
    if (room.phase !== "results") return cb?.({ ok: false, error: "Il round non è ancora finito." });

    room.roundIndex += 1;
    startRound(room);
    cb?.({ ok: true });
  });

  socket.on("restart_game", (_, cb) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) return cb?.({ ok: false, error: "Stanza non trovata." });
    if (room.hostId !== socket.id) return cb?.({ ok: false, error: "Solo l'host può riavviare." });
    if (room.phase !== "final") return cb?.({ ok: false, error: "La partita non è finita." });

    for (const p of room.players.values()) p.score = 0;
    room.roundIndex = 0;
    room.phase = "lobby";
    room.questionOrder = [...Array(QUESTION_BANK.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, room.totalRounds);

    io.to(room.code).emit("back_to_lobby");
    broadcastRoom(room);
    cb?.({ ok: true });
  });

  socket.on("disconnect", () => {
    leaveRoom(socket);
  });
});

server.listen(PORT, () => {
  console.log(`BLUFF1.0 attivo su http://localhost:${PORT}`);
});
