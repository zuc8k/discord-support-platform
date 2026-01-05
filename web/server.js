require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// ================== HOME ==================
app.get("/", (req, res) => {
  res.send(`
    <h1>PRIME PLATFORM</h1>
    <p>This is the official support & subscription platform.</p>
    <a href="/login">Login with Discord</a>
  `);
});

// ================== LOGIN PLACEHOLDER ==================
app.get("/login", (req, res) => {
  res.send("Discord OAuth will be here.");
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`🌐 Website running on http://localhost:${PORT}`);
});