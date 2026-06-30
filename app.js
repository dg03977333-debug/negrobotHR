const { Highrise, Events } = require("highrise.sdk.dev");

// 🔑 CONFIGURACIÓN DE LA SALA COMPARTIDA
const ROOM_ID = "6a35c8b2ddfd56b6eb7ff09e";

// 🤖 BOT: EL CHATBOT
const botChat = new Highrise({
    Events: [Events.Messages, Events.Joins, Events.Moves]
});

const saludosRandom = [
    (name) => `¡Esaaa @${name}! Pasá que armamos alta joda. 🔥✨`,
    (name) => `¡Bienvenido/a @${name}! Pasala piola amiguiño, poné !ayuda. 😎`,
    (name) => `Llegó el alma de la fiesta: @${name} OOOOAAAAA 💎💘`
];

// 🧠 MEMORIA LOCAL DE POSICIONES
const posicionesUsuarios = new Map();  
let intervaloSpam = null;

// =========================================================================
// 💬 EVENTOS BOT (MENSAJES Y TP)
// =========================================================================
botChat.on("ready", (session) => {
    console.log("💬 Bot (Mensajes) Conectado con éxito a Render.");
    botChat.selfId = session.userId;
    setInterval(() => { botChat.message.send("TUMEGUSTAS").catch(() => {}); }, 140000);
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
        botChat.message.send(`🏃‍♂️ [!veni] / veni ➤ Trae al Bot de Mensajes a tu lado.`);
        botChat.message.send(`📍 [!piso 0 / !piso 1 / !juego] ➤ Teletransportes fijos.\n🎯 [!tp @user] ➤ Teletransportarte a un usuario.`);
        botChat.message.send("🔥 **MODO JODA** 🔥\n📢 [!spam (texto)] / [!stopspam]");
        return;
    }

    if (message === "!uwu") return botChat.message.send("💎💘ONICHAAAAAAAAAAAAAN🔥✨");

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

    // 🎯 COMANDO !TP @USER
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

    // 📍 TELETRANSPORTES FIJOS (¡Acá podés editar los números con tus :coords nuevas!)
    if (message === "!piso 1") return botChat.player.teleport(user.id, 10.0, 8.0, 19.0).catch(() => {});
    if (message === "!piso 0") return botChat.player.teleport(user.id, 13.0, 0.0, 0.0).catch(() => {});
    if (message === "!juego") return botChat.player.teleport(user.id, 10.0, 0.5, 10.0).catch(() => {});
});

botChat.on("error", (msg) => console.log("Error ChatBot: ", msg));

// 🌐 SERVIDOR WEB FALSO PARA QUE RENDER NO APAGUE EL BOT
const http = require("http");
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot Online 24/7");
});
server.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Servidor de respaldo activo para Render.");
});

// 🔑 INICIO DE SESIÓN CON TU TOKEN DE MENSAJES
botChat.login("19836a59f087e24a70d5bb6c0221b11b33708dba1b50b510aa45251fb9e2407d", ROOM_ID);