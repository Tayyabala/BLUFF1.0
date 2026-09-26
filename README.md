# BLUFF1.0

Gioco multiplayer mobile in stile bluff/quiz.

## Regole
- Ogni round mostra una domanda.
- Ogni giocatore scrive una risposta falsa.
- Il gioco mescola tutti i bluff con la risposta corretta.
- Ogni giocatore vota la risposta che pensa sia vera.
- +2 punti se indovini la risposta corretta.
- +1 punto per ogni giocatore che vota il bluff scritto da te.
- Non puoi votare il tuo stesso bluff.

## Requisiti
Installa Node.js 18 o superiore.

## Avvio sul computer
Apri un terminale nella cartella BLUFF1.0 ed esegui:

```bash
npm install
npm start
```

Poi apri:

http://localhost:3000

## Provarlo dal telefono nella stessa rete Wi‑Fi
1. Computer e telefono devono essere sulla stessa rete Wi‑Fi.
2. Avvia il gioco sul computer con `npm start`.
3. Trova l'indirizzo IP locale del computer.
   - Windows: `ipconfig`
   - macOS/Linux: `ifconfig` oppure `ip addr`
4. Sul telefono apri, per esempio:

```text
http://192.168.1.20:3000
```

Sostituisci l'IP con quello del tuo computer.

## Pubblicazione online
La soluzione più semplice per questa versione è un hosting Node.js che supporti WebSocket, per esempio Render o Railway.

### Render
1. Crea un repository GitHub con questi file.
2. Su Render crea un nuovo Web Service collegato al repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Pubblica.

Il server usa automaticamente la porta fornita dall'hosting tramite `process.env.PORT`.

## Struttura
- `server.js` — server multiplayer, stanze, round, punteggi
- `public/index.html` — interfaccia
- `public/style.css` — stile mobile
- `public/app.js` — logica lato telefono/browser
- `package.json` — dipendenze

## Limiti della versione 1.0
- Le stanze vivono solo in memoria: se il server viene riavviato, si cancellano.
- Se un giocatore ricarica la pagina durante una partita, viene considerato disconnesso.
- Non c'è ancora un account utente.
- Le domande sono integrate nel server.

## Idee per BLUFF1.1
- riconnessione automatica dopo refresh
- categorie
- timer
- domande personalizzate dall'host
- modalità 2 vs 2
- suoni e animazioni
- QR code per entrare
- modalità privata/pubblica
- database con statistiche e vittorie
