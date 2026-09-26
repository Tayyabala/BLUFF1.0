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
  { q: "Quale animale è noto per cambiare colore per mimetizzarsi?", a: "Camaleonte" },
 
  // GEOGRAFIA — 1-20
{ q: "Qual è la capitale della Turchia?", a: "Ankara" },
{ q: "Qual è la capitale del Brasile?", a: "Brasilia" },
{ q: "Qual è la capitale del Marocco?", a: "Rabat" },
{ q: "Qual è la capitale della Svizzera, intesa come città federale?", a: "Berna" },
{ q: "Qual è la capitale del Vietnam?", a: "Hanoi" },
{ q: "Qual è la capitale della Mongolia?", a: "Ulan Bator" },
{ q: "Qual è la capitale del Nepal?", a: "Kathmandu" },
{ q: "Qual è la capitale del Bhutan?", a: "Thimphu" },
{ q: "Qual è la capitale del Madagascar?", a: "Antananarivo" },
{ q: "Qual è la capitale del Burkina Faso?", a: "Ouagadougou" },
{ q: "Qual è la capitale del Kirghizistan?", a: "Bishkek" },
{ q: "Qual è la capitale del Tagikistan?", a: "Dushanbe" },
{ q: "Qual è la capitale del Suriname?", a: "Paramaribo" },
{ q: "Qual è la capitale del Belize?", a: "Belmopan" },
{ q: "Qual è la capitale del Laos?", a: "Vientiane" },
{ q: "Qual è la capitale dell'Eritrea?", a: "Asmara" },
{ q: "Qual è la capitale della Namibia?", a: "Windhoek" },
{ q: "Qual è la capitale delle Figi?", a: "Suva" },
{ q: "Qual è la capitale di Samoa?", a: "Apia" },
{ q: "Qual è la capitale del Liechtenstein?", a: "Vaduz" },

// GEOGRAFIA — 21-40
{ q: "Quale Stato è completamente circondato dal Sudafrica?", a: "Lesotho" },
{ q: "Quale piccolo Stato si trova sui Pirenei tra Francia e Spagna?", a: "Andorra" },
{ q: "Quale Stato indipendente è interamente racchiuso nella città di Roma?", a: "Città del Vaticano" },
{ q: "Qual è lo Stato più piccolo del mondo per superficie?", a: "Città del Vaticano" },
{ q: "Qual è lo Stato più grande del mondo per superficie?", a: "Russia" },
{ q: "Quale Paese africano circonda il Gambia sui suoi confini terrestri?", a: "Senegal" },
{ q: "Quali due Paesi si dividono l'isola di Hispaniola?", a: "Haiti e Repubblica Dominicana" },
{ q: "Quali tre Paesi si dividono l'isola del Borneo?", a: "Indonesia, Malaysia e Brunei" },
{ q: "A quale Paese appartengono le isole Galápagos?", a: "Ecuador" },
{ q: "A quale Paese appartiene l'Isola di Pasqua?", a: "Cile" },
{ q: "A quale Paese appartengono le isole Canarie?", a: "Spagna" },
{ q: "A quale Paese appartengono le Azzorre?", a: "Portogallo" },
{ q: "A quale Paese appartiene l'isola di Socotra?", a: "Yemen" },
{ q: "Di quale regno fa parte la Groenlandia?", a: "Danimarca" },
{ q: "Quale Paese ha una bandiera nazionale formata da due triangoli sovrapposti?", a: "Nepal" },
{ q: "Quale Paese ha una foglia d'acero sulla bandiera?", a: "Canada" },
{ q: "Quale Paese ha un drago sulla bandiera nazionale ed è situato sull'Himalaya?", a: "Bhutan" },
{ q: "Quale Paese sudamericano ha l'olandese come lingua ufficiale?", a: "Suriname" },
{ q: "Qual è la lingua ufficiale del Brasile?", a: "Portoghese" },
{ q: "Quale Paese europeo confina con il Brasile attraverso la Guyana francese?", a: "Francia" },

// GEOGRAFIA — 41-60
{ q: "Qual è il deserto più grande della Terra, considerando anche quelli polari?", a: "Antartide" },
{ q: "Qual è il deserto caldo più grande del mondo?", a: "Sahara" },
{ q: "Qual è il lago più profondo del mondo?", a: "Lago Bajkal" },
{ q: "Qual è il lago più grande del mondo per superficie?", a: "Mar Caspio" },
{ q: "Quale mare è delimitato da correnti oceaniche anziché da coste?", a: "Mar dei Sargassi" },
{ q: "Qual è l'isola più grande del mondo, escludendo i continenti?", a: "Groenlandia" },
{ q: "Qual è l'isola più grande del Mediterraneo?", a: "Sicilia" },
{ q: "Qual è la montagna più alta dell'Africa?", a: "Kilimangiaro" },
{ q: "In quale Paese si trova il Kilimangiaro?", a: "Tanzania" },
{ q: "Qual è la montagna più alta del Sud America?", a: "Aconcagua" },
{ q: "Quale catena montuosa percorre il margine occidentale del Sud America?", a: "Ande" },
{ q: "Quale stretto separa la Spagna dal Marocco?", a: "Stretto di Gibilterra" },
{ q: "Quale stretto separa l'Alaska dalla Russia?", a: "Stretto di Bering" },
{ q: "Quale stretto separa la parte europea e quella asiatica di Istanbul?", a: "Bosforo" },
{ q: "Quale canale collega il Mediterraneo al Mar Rosso?", a: "Canale di Suez" },
{ q: "Quale canale permette di passare dall'Atlantico al Pacifico attraverso l'America centrale?", a: "Canale di Panama" },
{ q: "Quale fiume attraversa Baghdad?", a: "Tigri" },
{ q: "Quale fiume attraversa Budapest?", a: "Danubio" },
{ q: "Quale fiume attraversa Praga?", a: "Moldava" },
{ q: "Quale fiume attraversa Parigi?", a: "Senna" },

// GEOGRAFIA — 61-80
{ q: "In quale Paese si trova la città di Timbuctù?", a: "Mali" },
{ q: "In quale Paese si trova il sito archeologico di Petra?", a: "Giordania" },
{ q: "In quale Paese si trova Machu Picchu?", a: "Perù" },
{ q: "In quale Paese si trova Angkor Wat?", a: "Cambogia" },
{ q: "In quale Paese si trova il Salar de Uyuni?", a: "Bolivia" },
{ q: "In quale Paese si trova la Cappadocia?", a: "Turchia" },
{ q: "In quale Paese si trova la regione della Transilvania?", a: "Romania" },
{ q: "Quali due Paesi condividono la regione della Patagonia?", a: "Argentina e Cile" },
{ q: "In quale Paese si trova il deserto di Atacama?", a: "Cile" },
{ q: "Tra quali due Paesi si trova il lago Titicaca?", a: "Perù e Bolivia" },
{ q: "Qual è la capitale costituzionale della Bolivia, diversa dalla sede del governo?", a: "Sucre" },
{ q: "Qual è la capitale dei Paesi Bassi, anche se il governo ha sede all'Aia?", a: "Amsterdam" },
{ q: "In quale città ha sede il governo dei Paesi Bassi?", a: "L'Aia" },
{ q: "Qual è la capitale amministrativa del Sudafrica?", a: "Pretoria" },
{ q: "Quale città sudafricana ospita il Parlamento nazionale?", a: "Città del Capo" },
{ q: "Qual è la capitale della Costa d'Avorio, diversa da Abidjan?", a: "Yamoussoukro" },
{ q: "Qual è la capitale della Tanzania, diversa da Dar es Salaam?", a: "Dodoma" },
{ q: "Quale Paese africano era chiamato Abissinia?", a: "Etiopia" },
{ q: "Quale Paese asiatico era chiamato Ceylon?", a: "Sri Lanka" },
{ q: "Quale città turca era chiamata Costantinopoli?", a: "Istanbul" },
  
  // VIDEOGIOCHI — 81-105
{ q: "Come si chiama il protagonista giocabile della maggior parte dei giochi di The Legend of Zelda?", a: "Link" },
{ q: "Come si chiama il regno in cui sono ambientati molti giochi di Zelda?", a: "Hyrule" },
{ q: "Come si chiama il fratello di Mario?", a: "Luigi" },
{ q: "Quale principessa viene rapita da Bowser in molti giochi di Super Mario?", a: "Peach" },
{ q: "Qual è il nome del Pokémon numero 001 nel Pokédex nazionale?", a: "Bulbasaur" },
{ q: "Di quale tipo è Pikachu?", a: "Elettro" },
{ q: "Quale Pokémon si evolve in Gyarados?", a: "Magikarp" },
{ q: "Come si chiama la regione di Pokémon Rosso e Blu?", a: "Kanto" },
{ q: "Di quale materiale è fatto il portale standard per il Nether in Minecraft?", a: "Ossidiana" },
{ q: "Come si chiama il nemico verde di Minecraft che esplode vicino al giocatore?", a: "Creeper" },
{ q: "Quale boss di Minecraft si affronta nell'End?", a: "Drago dell'End" },
{ q: "Come si chiama la città principale di GTA: San Andreas ispirata a Los Angeles?", a: "Los Santos" },
{ q: "Qual è il nome completo del protagonista CJ in GTA: San Andreas?", a: "Carl Johnson" },
{ q: "Come si chiama il protagonista principale di Red Dead Redemption 2?", a: "Arthur Morgan" },
{ q: "Qual è il numero identificativo di Master Chief nella saga Halo?", a: "117" },
{ q: "Come si chiama l'intelligenza artificiale antagonista del primo Portal?", a: "GLaDOS" },
{ q: "Come si chiama la città sottomarina del primo BioShock?", a: "Rapture" },
{ q: "Come si chiama la città volante di BioShock Infinite?", a: "Columbia" },
{ q: "Come si chiama il protagonista di The Witcher 3?", a: "Geralt di Rivia" },
{ q: "Quale videogioco ha come protagonista l'archeologa Lara Croft?", a: "Tomb Raider" },
{ q: "Come si chiama il protagonista di God of War?", a: "Kratos" },
{ q: "Come si chiama il figlio di Kratos in God of War del 2018?", a: "Atreus" },
{ q: "Quale azienda giapponese ha creato Sonic?", a: "SEGA" },
{ q: "Come si chiama la valuta utilizzata nei giochi principali di Animal Crossing in italiano?", a: "Stelline" },
{ q: "Quale videogioco del 1984 fu creato da Aleksej Pajitnov usando blocchi di quattro quadrati?", a: "Tetris" },
  
  // SERIE TV — 106-130
{ q: "Quale pseudonimo usa Walter White in Breaking Bad?", a: "Heisenberg" },
{ q: "In quale città del New Mexico è ambientata Breaking Bad?", a: "Albuquerque" },
{ q: "Come si chiama la catena di fast food di Gus Fring in Breaking Bad?", a: "Los Pollos Hermanos" },
{ q: "Qual è il vero nome di Saul Goodman in Better Call Saul?", a: "Jimmy McGill" },
{ q: "Come si chiama il bar frequentato dai protagonisti di Friends?", a: "Central Perk" },
{ q: "Qual è il cognome di Joey in Friends?", a: "Tribbiani" },
{ q: "Come si chiama la ditta di carta nella versione statunitense di The Office?", a: "Dunder Mifflin" },
{ q: "In quale città della Pennsylvania si trova l'ufficio principale della serie The Office USA?", a: "Scranton" },
{ q: "Come si chiama la cittadina dell'Indiana in cui inizia Stranger Things?", a: "Hawkins" },
{ q: "Qual è il nome italiano della dimensione parallela di Stranger Things?", a: "Sottosopra" },
{ q: "Quale numero identifica la protagonista dotata di poteri in Stranger Things?", a: "Undici" },
{ q: "Qual è il motto della casa Stark in Game of Thrones?", a: "L'inverno sta arrivando" },
{ q: "Come si chiama la spada di Arya Stark nella versione italiana di Game of Thrones?", a: "Ago" },
{ q: "Come si chiama il continente a ovest di Essos in Game of Thrones?", a: "Westeros" },
{ q: "In quale città immaginaria tedesca è ambientata Dark?", a: "Winden" },
{ q: "Qual è il numero del giocatore Seong Gi-hun in Squid Game?", a: "456" },
{ q: "Quale nome di città usa il personaggio interpretato da Úrsula Corberó ne La casa di carta?", a: "Tokyo" },
{ q: "Qual è il vero nome del Professore ne La casa di carta?", a: "Sergio Marquina" },
{ q: "Come si chiama l'azienda protagonista di Succession?", a: "Waystar Royco" },
{ q: "Come si chiama l'azienda per cui lavorano i protagonisti di Severance?", a: "Lumon" },
{ q: "Come si chiama il protagonista maschile di Fleabag interpretato da Andrew Scott, indicato tramite il suo ruolo?", a: "Il prete" },
{ q: "Qual è il cognome della protagonista Issa in Insecure?", a: "Dee" },
{ q: "Come si chiama la migliore amica avvocata di Issa in Insecure?", a: "Molly" },
{ q: "Qual è il cognome di Spencer, il giovane genio di Criminal Minds?", a: "Reid" },
{ q: "Qual è il nome del volo su cui viaggiano i protagonisti di Lost prima dello schianto?", a: "Oceanic 815" },
 
  // FILM — 131-155
{ q: "Chi ha diretto Titanic del 1997?", a: "James Cameron" },
{ q: "Come si chiama il pianeta abitato dai Na'vi in Avatar?", a: "Pandora" },
{ q: "Quale pillola sceglie Neo per scoprire la verità in Matrix?", a: "Pillola rossa" },
{ q: "Qual è il nome anagrafico di Neo in Matrix?", a: "Thomas Anderson" },
{ q: "Come si chiama la macchina del tempo di Ritorno al futuro, indicando la marca dell'auto?", a: "DeLorean" },
{ q: "A quale velocità in miglia orarie deve arrivare la DeLorean per viaggiare nel tempo?", a: "88" },
{ q: "Qual è il nome da Sith di Anakin Skywalker?", a: "Darth Vader" },
{ q: "Come si chiama il pianeta natale di Luke Skywalker, dove cresce con gli zii?", a: "Tatooine" },
{ q: "Come si chiama l'astronave di Han Solo?", a: "Millennium Falcon" },
{ q: "Come si chiama il vulcano in cui deve essere distrutto l'Unico Anello?", a: "Monte Fato" },
{ q: "Qual è il nome originale di Gollum?", a: "Sméagol" },
{ q: "Quale attore interpreta Jack Sparrow nei film dei Pirati dei Caraibi?", a: "Johnny Depp" },
{ q: "Come si chiama la nave di Jack Sparrow?", a: "Perla Nera" },
{ q: "Come si chiama il cowboy di Toy Story?", a: "Woody" },
{ q: "Che specie di pesce è Nemo?", a: "Pesce pagliaccio" },
{ q: "Come si chiama il topo protagonista di Ratatouille?", a: "Rémy" },
{ q: "Quale animale è Po, il protagonista di Kung Fu Panda?", a: "Panda gigante" },
{ q: "Come si chiama la città in cui è ambientato Zootropolis nella versione italiana?", a: "Zootropolis" },
{ q: "Qual è il cognome della famiglia protagonista di Encanto?", a: "Madrigal" },
{ q: "Quale regista ha diretto Pulp Fiction?", a: "Quentin Tarantino" },
{ q: "Chi ha diretto il film sudcoreano Parasite?", a: "Bong Joon-ho" },
{ q: "Quale attore interpreta il professor Paul Hunham in The Holdovers?", a: "Paul Giamatti" },
{ q: "Come si chiama la bambina che partecipa al concorso in Little Miss Sunshine?", a: "Olive" },
{ q: "Da quale scrittore è stato tratto il racconto alla base di Stand by Me?", a: "Stephen King" },
{ q: "Quale oggetto usa Cobb come trottola-totem in Inception?", a: "Una trottola" },

  // ANIME — 156-175
{ q: "Qual è il nome Saiyan di Goku?", a: "Kakarot" },
{ q: "Come si chiama il pianeta d'origine di Piccolo in Dragon Ball?", a: "Namecc" },
{ q: "Quante Sfere del Drago terrestri bisogna riunire per evocare Shenron?", a: "7" },
{ q: "Come si chiama il primo figlio di Goku?", a: "Gohan" },
{ q: "Qual è il nome della volpe a nove code sigillata in Naruto?", a: "Kurama" },
{ q: "A quale clan appartiene Sasuke in Naruto?", a: "Uchiha" },
{ q: "Come si chiama il maestro del Team 7 all'inizio di Naruto?", a: "Kakashi Hatake" },
{ q: "Come si chiama lo shinigami che accompagna Light in Death Note?", a: "Ryuk" },
{ q: "Quale frutto ama mangiare Ryuk in Death Note?", a: "Mele" },
{ q: "Qual è il cognome di Light in Death Note?", a: "Yagami" },
{ q: "Come si chiama lo spadaccino della ciurma di Cappello di Paglia in One Piece?", a: "Roronoa Zoro" },
{ q: "Come si chiama il cuoco della ciurma di Cappello di Paglia in One Piece?", a: "Sanji" },
{ q: "Come si chiama la prima nave principale della ciurma di Cappello di Paglia?", a: "Going Merry" },
{ q: "Qual è il cognome dei fratelli Edward e Alphonse in Fullmetal Alchemist?", a: "Elric" },
{ q: "Quale principio fondamentale regola l'alchimia in Fullmetal Alchemist?", a: "Scambio equivalente" },
{ q: "Come si chiama la sorella di Tanjiro in Demon Slayer?", a: "Nezuko" },
{ q: "Come si chiama il protagonista di One-Punch Man?", a: "Saitama" },
{ q: "Come si chiama il protagonista di Attack on Titan?", a: "Eren Jaeger" },
{ q: "Come si chiama il quaderno che permette di uccidere scrivendo il nome di una persona nell'omonimo anime?", a: "Death Note" },
{ q: "Come si chiama la squadra scolastica di Mark Evans all'inizio di Inazuma Eleven?", a: "Raimon" },

 // CULTURA GENERALE — 176-200
{ q: "Quale mammifero australiano è famoso per produrre escrementi a forma di cubo?", a: "Wombat" },
{ q: "Quanti cuori ha un polpo?", a: "3" },
{ q: "Di che colore è il sangue dei polpi quando è ossigenato?", a: "Blu" },
{ q: "Quale mammifero dal becco simile a quello di un'anatra depone uova?", a: "Ornitorinco" },
{ q: "Quale uccello depone le uova più grandi tra le specie viventi?", a: "Struzzo" },
{ q: "Qual è il pianeta più caldo del Sistema Solare?", a: "Venere" },
{ q: "Su quale pianeta una rotazione completa dura più di una rivoluzione intorno al Sole?", a: "Venere" },
{ q: "Qual è il pianeta più grande del Sistema Solare?", a: "Giove" },
{ q: "Qual è il pianeta più vicino al Sole?", a: "Mercurio" },
{ q: "Quale elemento chimico ha simbolo W?", a: "Tungsteno" },
{ q: "Quale elemento chimico ha simbolo Ag?", a: "Argento" },
{ q: "Quale elemento chimico ha simbolo K?", a: "Potassio" },
{ q: "Qual è il numero primo più piccolo?", a: "2" },
{ q: "Quanti mesi dell'anno hanno almeno 28 giorni?", a: "12" },
{ q: "In una corsa, se superi chi è secondo, in quale posizione ti trovi?", a: "Seconda" },
{ q: "Quanto pesa un chilogrammo di piume rispetto a un chilogrammo di ferro?", a: "Lo stesso" },
{ q: "Quante volte puoi sottrarre 10 da 100 prima di iniziare a sottrarre da un altro numero?", a: "Una" },
{ q: "Quale animale dà il nome alle isole Canarie secondo l'etimologia tradizionale?", a: "Cane" },
{ q: "Da quale Paese europeo deriva il nome del panama, sebbene il cappello sia originario dell'Ecuador?", a: "Nessuno: Panama è in America" },
{ q: "Quale Paese regalò la Statua della Libertà agli Stati Uniti?", a: "Francia" },
{ q: "In quale anno cadde il Muro di Berlino?", a: "1989" },
{ q: "Chi fu il primo essere umano a viaggiare nello spazio?", a: "Jurij Gagarin" },
{ q: "Quale compositore scrisse Le quattro stagioni?", a: "Antonio Vivaldi" },
{ q: "Chi ha scritto il romanzo 1984?", a: "George Orwell" },
{ q: "Quale pittore realizzò La persistenza della memoria, con gli orologi molli?", a: "Salvador Dalí" }, 
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
  const palette = [
    "#FF7676", // Rosso
    "#69AEFF", // Blu
    "#65D99A", // Verde
    "#FFD166", // Giallo
    "#BE98FF", // Viola
    "#FFAD66", // Arancione
    "#FF91C8", // Rosa
    "#66DDD5", // Turchese
    "#C4DE70", // Lime
    "#C9AC91", // Sabbia
    "#A8BCFF", // Lavanda
    "#EEEEEE"  // Bianco
  ];

  const usedColors = new Set(
    [...room.players.values()]
      .map(p => p.color)
      .filter(Boolean)
  );

  for (const player of room.players.values()) {
    if (player.color) continue;

    let color = palette.find(c => !usedColors.has(c));

    // Se finiscono i colori della palette, ne genera altri.
    if (!color) {
      let index = room.avatarColorIndex || 0;

      do {
        const hue = (index * 137.508) % 360;
        color = `hsl(${hue.toFixed(3)}, 70%, 72%)`;
        index++;
      } while (usedColors.has(color));

      room.avatarColorIndex = index;
    }

    player.color = color;
    usedColors.add(color);
  }

  return [...room.players.values()].map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
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

  socket.on("start_game", ({ totalRounds }, cb) => {
  const room = rooms.get(socket.data.roomCode);

  if (!room)
    return cb?.({ ok: false, error: "Stanza non trovata." });

  if (room.hostId !== socket.id)
    return cb?.({ ok: false, error: "Solo l'host può iniziare." });

  if (activePlayers(room).length < 2)
    return cb?.({ ok: false, error: "Servono almeno 2 giocatori." });

  if (room.phase !== "lobby")
    return cb?.({ ok: false, error: "La partita è già iniziata." });

  // Imposta il numero di round scelto nella lobby
  room.totalRounds = Math.min(
    10,
    Math.max(3, Number(totalRounds) || 5)
  );

  // Genera le domande in base al numero di round scelto
  room.questionOrder = [...Array(QUESTION_BANK.length).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, room.totalRounds);

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
