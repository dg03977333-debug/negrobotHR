const { Highrise, Events } = require("highrise.sdk.dev");

// 🔑 CONFIGURACIÓN DE LA SALA
const ROOM_ID = "6a35c8b2ddfd56b6eb7ff09e";

// 🤖 UN SOLO BOT PARA TODO
const bot = new Highrise({
    Events: [Events.Messages, Events.Joins, Events.Moves]
});

// 🌟 LISTA DE EMOTES COMPLETA (82)
const listaEmotes = [
    "dance-russian", "dance-shoppingcart", "dance-pennywise", "dance-handsup", 
    "dance-wrong", "dance-icecream", "dance-disco", "idle-dance-casual",
    "emote-model", "emote-curtsy", "emote-greedy", "emote-bow", 
    "emote-snowball", "emote-charging", "emote-float", "emote-enthused", 
    "emote-swordfight", "emote-telekinesis", "emote-energyball", "emote-snowangel", 
    "emote-cutey", "emote-pose1", "emote-pose3", "emote-pose5", 
    "emote-pose7", "emote-pose8", "emote-savage", "emote-fashion", 
    "emote-gravity", "emote-sleigh", "emote-hyped", "emote-punk", 
    "emote-shy", "emote-celebrate", "emote-surprise", "advancedshy", 
    "emote-iceskating", "emote-headblowup", "emote-ditzypose", "emote-gift", 
    "emote-pushit", "emote-launch", "emote-salute", "emote-cutesalute", 
    "emote-fairytwirl", "emote-fairyfloat", "emote-smooch", "emote-fishingpull", 
    "emote-sit", "emote-cozynap", "emote-irritated", "emote-fly", 
    "emote-think", "emote-theatrical", "emote-superrun", "emote-superpunch", 
    "emote-sumofight", "emote-thumbsuck", "emote-secrethandshake", "emote-ropepull", 
    "emote-roll", "emote-rofl", "emote-robot", "rainbow", 
    "emote-proposing", "peekaboo", "emote-peace", "emote-panic", 
    "emote-no", "emote-amused", "jump", "emote-judochop", 
    "emote-hello", "emote-happy", "emote-faint", "emote-clumsy", 
    "emote-facepalm", "emote-exasperated", "elbowbump", "emote-blastoff", 
    "emote-revival", "emote-boo"
];

const playlist = {
    "1": { tema: "La Morocha - Luck Ra 🎤🕺", emote: "dance-russian" },
    "2": { tema: "Hardbass Ruso Mix 🇷🇺🔥", emote: "dance-russian" },
    "3": { tema: "Electrónica ATR 🎧⚡", emote: "dance-shoppingcart" }
};

const saludosRandom = [
    (name) => `¡Esaaa @${name}! Pasá que armamos alta joda. 🔥✨`,
    (name) => `¡Bienvenido/a @${name}! Pasala piola amiguiño, poné !ayuda. 😎`,
    (name) => `Llegó el alma de la fiesta: @${name} OOOOAAAAA 💎💘`
];

// 🧠 MEMORIA LOCAL
const posicionesUsuarios = new Map();  
const jugadoresBailando = new Map();   
let intervaloSpam = null;

function iniciarLoopBaile(userId, emote) {
    if (jugadoresBailando.has(userId)) {
        clearInterval(jugadoresBailando.get(userId));
    }
    bot.player.emote(userId, emote).catch(() => {});
    const intervalo = setInterval(() => {
        bot.player.emote(userId, emote).catch(() => {
            clearInterval(intervalo);
            jugadoresBailando.delete(userId);
        });
    }, 10000); 
    jugadoresBailando.set(userId, intervalo);
}

// =========================================================================
// 🚀 EVENTOS DEL BOT ÚNICO
// =========================================================================
bot.on("ready", (session) => {
    console.log("🤖 El Súper Bot Único está Conectado con éxito a Render.");
    bot.selfId = session.userId;
    setInterval(() => { bot.message.send("TUMEGUSTAS").catch(() => {}); }, 140000);
});

bot.on("playerJoin", (user, position) => {
    if (position) {
        posicionesUsuarios.set(user.id, { x: position.x, y: position.y, z: position.z, username: user.username.toLowerCase() });
    }
    const saludoElegido = saludosRandom[Math.floor(Math.random() * saludosRandom.length)];
    bot.message.send(saludoElegido(user.username)).catch(() => {});
});

bot.on("playerMove", (user, position) => {
    if (position && position.x !== undefined) {
        posicionesUsuarios.set(user.id, { x: position.x, y: position.y, z: position.z, username: user.username.toLowerCase() });
    }
});

bot.on("chatCreate", async (user, message) => {
    // FRENAR BAILES
    if (message === "!alto" || message === "!stop" || message === "alto") {
        if (jugadoresBailando.has(user.id)) {
            clearInterval(jugadoresBailando.get(user.id));
            jugadoresBailando.delete(user.id);
        }
        return;
    }

    // BAILE MASIVO
    if (message === "!bailen" || message === "bailen") {
        const baile = listaEmotes[Math.floor(Math.random() * listaEmotes.length)];
        for (const idUsuario of posicionesUsuarios.keys()) {
            bot.player.emote(idUsuario, baile).catch(() => {});
        }
        return;
    }

    // ACTIVAR PLAYLIST
    if (message.startsWith("!play ")) {
        const eleccion = message.replace("!play ", "").trim();
        if (playlist[eleccion]) {
            bot.whisper.send(user.id, `🎶 Pusiste: ${playlist[eleccion].tema}`).catch(() => {});
            iniciarLoopBaile(user.id, playlist[eleccion].emote);
        }
        return;
    }

    // BAILAR POR NÚMERO (1 al 82)
    const numero = parseInt(message);
    if (!isNaN(numero) && numero >= 1 && numero <= listaEmotes.length) {
        const emote = listaEmotes[numero - 1];
        bot.whisper.send(user.id, `✨ Bailando N°${numero} [ID: ${emote}].`).catch(() => {});
        iniciarLoopBaile(user.id, emote);
        return;
    }

    // RESPUESTAS AUTOMÁTICAS
    if (message === "Hola") return bot.message.send("Konnichiwa uwu!");
    if (message === "Holis") return bot.whisper.send(user.id, "Si la belleza fuera un crimen tu estarias libre.");
    if (message === "!uwu") return bot.message.send("💎💘ONICHAAAAAAAAAAAAAN🔥✨");

    // PANEL DE AYUDA
    if (message === "!ayuda" || message === "!help") {
        bot.message.send("⚙️ 🛠️ **COMANDOS DEL BOT** ⚙️ 🛠️");
        bot.message.send(`🔢 [1 al ${listaEmotes.length}] ➤ Bailar en bucle.\n🛑 [!alto] ➤ Frenar tu baile.\n🏃‍♂️ [!veni] ➤ Trae al bot a tu lado.`);
        bot.message.send(`📍 [!piso 0 / !piso 1 / !juego] ➤ Teleports fijos.\n🎯 [!tp @user] ➤ Teletransportarte a un usuario.`);
        bot.message.send("🔥 **MODO JODA** 🔥\n🕺 [!bailen] ➤ Baile masivo.\n📢 [!spam (texto)] / [!stopspam]");
        return;
    }

    // SISTEMA DE SPAM
    if (message.startsWith("!spam ") || message.startsWith("spam ")) {
        if (intervaloSpam !== null) return bot.message.send("⚠️ Frená el anterior con !stopspam.");
        let texto = message.replace("!spam ", "").replace("spam ", "").trim();
        if (!texto) return bot.message.send("❌ Uso: !spam [mensaje]");
        bot.message.send(`🚀 Iniciando spam: "${texto}"`);
        intervaloSpam = setInterval(() => { bot.message.send(texto).catch(() => {}); }, 1000); 
        return;
    }
    if (message === "!stopspam" || message === "stopspam") {
        if (intervaloSpam === null) return bot.message.send("No hay spam activo.");
        clearInterval(intervaloSpam);
        intervaloSpam = null;
        return bot.message.send("🛑 Spam apagado.");
    }

    // COMANDO !VENI
    if (message === "!veni" || message === "veni") {
        const misCoordenadas = posicionesUsuarios.get(user.id);
        if (misCoordenadas) {
            bot.message.send(`🏃‍♂️ Voy para allá, @${user.username}!`);
            return bot.player.teleport(bot.selfId, misCoordenadas.x, misCoordenadas.y, misCoordenadas.z).catch(() => {});
        } else {
            return bot.whisper.send(user.id, "Da un paso para que registre tu ubicación actual.");
        }
    }

    // COMANDO !TP @USER
    if (message.startsWith("!tp @") || message.startsWith("!tp ")) {
        const objetivoTexto = message.replace("!tp @", "").replace("!tp ", "").trim().toLowerCase();
        
        if (objetivoTexto !== "1" && objetivoTexto !== "2" && objetivoTexto !== "3") {
            let objetivoEncontrado = null;

            for (const [id, datos] of posicionesUsuarios.entries()) {
                if (datos.username === objetivoTexto) {
                    objetivoEncontrado = datos;
                    break;
                }
            }

            if (objetivoEncontrado) {
                bot.message.send(`✨ Teletransportando a @${user.username} hacia @${objetivoTexto}.`);
                return bot.player.teleport(user.id, objetivoEncontrado.x, objetivoEncontrado.y, objetivoEncontrado.z).catch(() => {});
            } else {
                return bot.message.send(`❌ No tengo registrado a @${objetivoTexto}. Decile que camine un paso.`);
            }
        }
    }

    // TELETRANSPORTES FIJOS (¡Cambiá acá las coordenadas si querés!)
    if (message === "!piso 1") return bot.player.teleport(user.id, 10.0, 8.0, 19.0).catch(() => {});
    if (message === "!piso 0") return bot.player.teleport(user.id, 13.0, 0.0, 0.0).catch(() => {});
    if (message === "!juego") return bot.player.teleport(user.id, 10.0, 0.5, 10.0).catch(() => {});
});

bot.on("error", (msg) => console.log("Error en el Bot Único: ", msg));

// 🌐 SERVIDOR WEB FALSO PARA RENDER
const http = require("http");
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot Unificado Online 24/7");
});
server.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Servidor de respaldo activo para Render.");
});

// 🔑 INICIO DE SESIÓN CON EL TOKEN DE MENSAJES (Controla todo ahora)
bot.login("19836a59f087e24a70d5bb6c0221b11b33708dba1b50b510aa45251fb9e2407d", ROOM_ID);