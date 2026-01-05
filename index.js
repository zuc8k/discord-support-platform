require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

/* ===========================
   WEB SERVER
=========================== */

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <h1>Support Platform</h1>
    <p>Official support & services website</p>
    <a href="/login">Login with Discord</a>
  `);
});

app.get("/login", (req, res) => {
  const redirectUri = "http://localhost:3000/callback";

  const url =
    "https://discord.com/api/oauth2/authorize" +
    `?client_id=${process.env.CLIENT_ID}` +
    "&response_type=code" +
    "&scope=identify" +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:3000/callback"
      })
    });

    const token = await tokenRes.json();

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    const user = await userRes.json();

    res.send(`
      <h2>Logged in</h2>
      <p>ID: ${user.id}</p>
      <p>Username: ${user.username}</p>
      <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="100" />
    `);
  } catch (err) {
    console.error(err);
    res.send("OAuth Failed");
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Website running on http://localhost:${PORT}`);
});

/* ===========================
   DISCORD BOT
=========================== */

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
});

const commands = [
  new SlashCommandBuilder()
    .setName("prime")
    .setDescription("View PRIME features")
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("✅ Slash command registered");
})();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "prime") {
    const embed = new EmbedBuilder()
      .setTitle("⭐ PRIME")
      .setDescription("Click below to view PRIME features")
      .setColor(0xF1C40F);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Open Website")
        .setStyle(ButtonStyle.Link)
        .setURL("http://localhost:3000")
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
});

client.login(process.env.DISCORD_TOKEN);