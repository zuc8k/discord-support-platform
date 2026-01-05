require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

// ================== CLIENT ==================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================== READY ==================
client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

// ================== SLASH COMMAND ==================
const commands = [
  new SlashCommandBuilder()
    .setName("prime")
    .setDescription("View PRIME features and website")
];

// ================== REGISTER COMMAND ==================
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered");
  } catch (err) {
    console.error(err);
  }
})();

// ================== INTERACTION ==================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "prime") {
    const embed = new EmbedBuilder()
      .setTitle("⭐ PRIME")
      .setDescription(
        "Unlock advanced features and priority support.\n\nClick the button below to continue."
      )
      .setColor(0xF1C40F)
      .setFooter({ text: "Official Support Server" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Go to Website")
        .setStyle(ButtonStyle.Link)
        .setURL("http://localhost:3000")
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
});

// ================== LOGIN ==================
client.login(process.env.DISCORD_TOKEN);