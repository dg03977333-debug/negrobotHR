const { Highrise, Events, Emotes } = require("highrise.sdk.dev");

// 🔑 CONFIGURACIÓN DE LA SALA COMPARTIDA
const ROOM_ID = "6a35c8b2ddfd56b6eb7ff09e";

// 🤖 BOT 1: EL ANIMADOR
const botBailes = new Highrise({
    Events: [Events.Messages, Events.Joins]
});

// 🤖 BOT 2: EL CHATBOT
const botChat = new Highrise({
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
    "emote-roll", "emote-rofl", "emote-robot", "emote-rainbow", 
    "emote-proposing", "peekaboo", "emote-peace", "emote-panic", 
    "emote-no", "emote-amused", "jump", "emote-judochop", 
    "emote-hello", "emote-happy", "emote-faint", "emote-clumsy", 
    "emote-facepalm", "emote-exasperated", "emote-elbowbump", "emote-blastoff", 
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

// 🧠 MEMORIA LOCAL DE POSICIONES
const posicionesUsuarios = new Map();  
const jugadoresBailando = new Map();   
let intervaloSpam = null;

function iniciarLoopBaile(userId, emote) {
    if (jugadoresBailando.has(userId)) {
        clearInterval(jugadoresBailando.get(userId));
    }
    botBailes.player.emote(userId, emote).catch(() => {});
    const intervalo = setInterval(() => {
        botBailes.player.emote(userId, emote).catch(() => {
            clearInterval(intervalo);
            jugadoresBailando.delete(userId);
        });
    }, 5000); 
    jugadoresBailando.set(userId, intervalo);
}

// =========================================================================
// 🕺 EVENTOS BOT 1 (BAILES)
// =========================================================================
botBailes.on("ready", () => console.log("🕺 Bot 1 (Bailes) Conectado con éxito."));

botBailes.on("chatCreate", async (user, message) => {
    if (message === "!alto" || message === "!stop" || message === "alto") {
        if (jugadoresBailando.has(user.id)) {
            clearInterval(jugadoresBailando.get(user.id));
            jugadoresBailando.delete(user.id);
        }
        return;
    }
    if (message === "!bailen" || message === "bailen") {
        const baile = listaEmotes[Math.floor(Math.random() * listaEmotes.length)];
        for (const idUsuario of posicionesUsuarios.keys()) {
            botBailes.player.emote(idUsuario, baile).catch(() => {});
        }
        return;
    }
    if (message.startsWith("!play ")) {
        const eleccion = message.replace("!play ", "").trim();
        if (playlist[eleccion]) {
            botBailes.whisper.send(user.id, `🎶 Pusiste: ${playlist[eleccion].tema}`).catch(() => {});
            iniciarLoopBaile(user.id, playlist[eleccion].emote);
        }
        return;
    }
    const numero = parseInt(message);
    if (!isNaN(numero) && numero >= 1 && numero <= listaEmotes.length) {
        const emote = listaEmotes[numero - 1];
        botBailes.whisper.send(user.id, `✨ Bailando N°${numero} [ID: ${emote}].`).catch(() => {});
        iniciarLoopBaile(user.id, emote);
    }
});

// =========================================================================
// 💬 EVENTOS BOT 2 (MENSAJES)
// =========================================================================
botChat.on("ready", (session) => {
    console.log("💬 Bot 2 (Mensajes) Conectado con éxito.");
    botChat.selfId = session.userId;
    setInterval(() => { botChat.message.send("TUMEGUSTAS").catch(() => {}); }, 120000);
});

botChat.on("playerJoin", (user, position) => {
    if (position) {
        posicionesUsuarios.set(user.id, { x: position.x, y: position.y, z: position.z, username: user.username.toLowerCase() });
    }
    const saludoElegido = saludosRandom[Math.floor(Math.random() * saludosRandom.length)];
    botChat.message.send(saludoElegido(user.username)).catch(() => {});
});

botChat.on("playerMove", (user, position) => {
    if (position && position.x !== undefined) {
        posicionesUsuarios.set(user.id, { x: position.x, y: position.y, z: position.z, username: user.username.toLowerCase() });
    }
});

botChat.on("chatCreate", async (user, message) => {
    if (!isNaN(parseInt(message))) return;

    if (message === "Hola") return botChat.message.send("Konnichiwa uwu!");
    if (message === "Holis") return botChat.whisper.send(user.id, "Si la belleza fuera un crimen tu estarias libre.");

    if (message === "!ayuda" || message === "!help") {
        botChat.message.send("⚙️ 🛠️ **COMANDOS** ⚙️ 🛠️");
        botChat.message.send(`🔢 [1 al ${listaEmotes.length}] ➤ Bailar en bucle.\n🛑 [!alto] ➤ Frenar baile.\n🏃‍♂️ [!veni] / veni ➤ Trae al Bot de Mensajes a tu lado.`);
        botChat.message.send(`📍 [!tp 1 / 2 / 3] ➤ Teletransportes fijos.\n🎯 [!tp @user] ➤ Teletransportarte a un usuario.`);
        botChat.message.send("🔥 **MODO JODA** 🔥\n❤️ [!miwacha] ➤ Modo ATR.\n🕺 [!bailen] ➤ Baile masivo.\n📢 [!spam (texto)] / [!stopspam]");
        return;
    }

    if (message === "!miwacha") return botChat.message.send("💎💘 ¡LAS WACHAS DEL NEGRO OOOOAAAAA! 🔥✨");

    if (message.startsWith("!spam ") || message.startsWith("spam ")) {
        if (intervaloSpam !== null) return botChat.message.send("⚠️ Frená el anterior con !stopspam.");
        let texto = message.replace("!spam ", "").replace("spam ", "").trim();
        if (!texto) return botChat.message.send("❌ Uso: !spam [mensaje]");
        botChat.message.send(`🚀 Iniciando spam: "${texto}"`);
        intervaloSpam = setInterval(() => { botChat.message.send(texto).catch(() => {}); }, 1000); 
        return;
    }
    if (message === "!stopspam" || message === "stopspam") {
        if (intervaloSpam === null) return botChat.message.send("No hay spam.");
        clearInterval(intervaloSpam);
        intervaloSpam = null;
        return botChat.message.send("🛑 Spam apagado.");
    }

    // 🏃‍♂️ COMANDO !VENI
    if (message === "!veni" || message === "veni") {
        const misCoordenadas = posicionesUsuarios.get(user.id);
        if (misCoordenadas) {
            botChat.message.send(`🏃‍♂️ Voy para allá, @${user.username}!`);
            return botChat.player.teleport(botChat.selfId, misCoordenadas.x, misCoordenadas.y, misCoordenadas.z).catch(() => {});
        } else {
            return botChat.whisper.send(user.id, "Da un paso para que registre tu ubicación actual.");
        }
    }

    // 🎯 NUEVO COMANDO !TP @USER
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
                botChat.message.send(`✨ Teletransportando a @${user.username} hacia @${objetivoTexto}.`);
                return botChat.player.teleport(user.id, objetivoEncontrado.x, objetivoEncontrado.y, objetivoEncontrado.z).catch(() => {});
            } else {
                return botChat.message.send(`❌ No tengo registrado a @${objetivoTexto}. Decile que camine un paso.`);
            }
        }
    }

    // 📍 TELETRANSPORTES FIJOS
    if (message === "!tp 1") return botChat.player.teleport(user.id, 5.5, 0.5, 3.5).catch(() => {});
    if (message === "!tp 2") return botChat.player.teleport(user.id, 2.0, 10.0, 2.0).catch(() => {});
    if (message === "!tp 3") return botChat.player.teleport(user.id, 0.0, 0.0, 0.0).catch(() => {});
});

botChat.on("error", (msg) => console.log("Error ChatBot: ", msg));
botBailes.on("error", (msg) => console.log("Error DanceBot: ", msg));

// 🌐 SERVIDOR WEB FALSO PARA QUE RENDER NO APAGUE EL BOT
const http = require("http");
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot Online 24/7");
});
server.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Servidor de respaldo activo para Render.");
});

// =========================================================================
// 🔑 INICIO DE SESIÓN OFICIAL CON TUS TOKENS DIRECTOS
// =========================================================================
botBailes.login("c0714b3b339702ffe4e197527900213964b27db3578bcd0d34b18658d31dedfd", ROOM_ID); 
botChat.login("19836a59f087e24a70d5bb6c0221b11b33708dba1b50b510aa45251fb9e2407d", ROOM_ID);