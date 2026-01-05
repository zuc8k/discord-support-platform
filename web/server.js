require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// ================== HOME ==================
app.get("/", (req, res) => {
  res.send(`
    <h1>Support Platform</h1>
    <p>Official support & services platform</p>
    <a href="/login">Login with Discord</a>
  `);
});

// ================== LOGIN ==================
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

// ================== CALLBACK ==================
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");

  try {
    // 1️⃣ Exchange code for token
    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: "http://localhost:3000/callback"
        })
      }
    );

    const tokenData = await tokenResponse.json();

    // 2️⃣ Get user info
    const userResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const user = await userResponse.json();

    // 3️⃣ Show user data
    res.send(`
      <h1>Logged In Successfully</h1>
      <p>ID: ${user.id}</p>
      <p>Username: ${user.username}</p>
      <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="100" />
    `);

  } catch (err) {
    console.error(err);
    res.send("OAuth Failed");
  }
});

// ================== START ==================
app.listen(PORT, () => {
  console.log(`🌐 Website running on http://localhost:${PORT}`);
});