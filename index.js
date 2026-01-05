/*************************************************
 * DISCORD SUPPORT PLATFORM
 * Single File (Bot + Website + OAuth + Session)
 *************************************************/

require("dotenv").config();

const express = require("express");
const session = require("express-session");
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
   EXPRESS WEBSITE
=========================== */

const app = express();
const PORT = process.env.PORT || 3000;

// Session
app.use(
  session({
    secret: "SUPPORT_PLATFORM_SECRET",
    resave: false,
    saveUninitialized: false
  })
);

// Home
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  res.send(`
    <h1>Support Platform</h1>
    <p>Official support & services platform</p>
    <a href="/login">Login with Discord</a>
  `);
});

// Login
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

// OAuth Callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");

  try {
    // Exchange code for token
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

    // Get user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    const user = await userRes.json();

    // Save session
    req.session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar
    };

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.send("OAuth Failed");
  }
});

// Dashboard
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const user = req.session.user;

  res.send(`
    <h1>Dashboard</h1>
    <p>ID: ${user.id}</p>
    <p>Username: ${user.username}</p>
    <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="120" />
    <hr/>
    <a href="/prime">View PRIME</a>
    <br/><br/>
    <a href="/logout">Logout</a>
  `);
});

// Prime Page
app.get("/prime", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  res.send(`
    <h1>⭐ PRIME</h1>
    <p>Unlock advanced features and priority support.</p>
    <ul>
      <li>Priority tickets</li>
      <li>Faster response</li>
      <li>Exclusive services</li>
    </ul>
    <button disabled>Subscribe (Coming Soon)</button>
    <br/><br/>
    <a href="/dashboard">Back</a>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Start Website
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

// Slash Command
const commands = [
  new SlashCommandBuilder()
    .setName("prime")
    .setDescription("Open PRIME page")
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash command registered");
  } catch (err) {
    console.error(err);
  }
})();

// Interaction
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "prime") {
    const embed = new EmbedBuilder()
      .setTitle("⭐ PRIME")
      .setDescription(
        "Unlock advanced features and priority support.\n\nClick below to continue."
      )
      .setColor(0xF1C40F);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Open PRIME Page")
        .setStyle(ButtonStyle.Link)
        .setURL("http://localhost:3000/prime")
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
});

// Login Bot
client.login(process.env.DISCORD_TOKEN);