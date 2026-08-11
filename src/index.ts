import { Client, GatewayIntentBits, Collection, Events, Interaction, Message, EmbedBuilder } from 'discord.js';
import express from 'express';
import { TOKEN, PORT } from './config.js';
import { roll } from './services/DiceService.js';
import { parseOptions, pick, shuffle } from './services/ChoiceService.js';
// import { spin } from './services/RouletteService.js'; // 註解輪盤
import { handleTarotDraw } from './interactions/commands/tarot.js';

// ─── Command Loader ────────────────────────────────────────────────────────────

import * as rollCommand from './interactions/commands/roll.js';
import * as choiceCommand from './interactions/commands/choice.js';
import * as shuffleCommand from './interactions/commands/shuffle.js';
import * as tarotModule from './interactions/commands/tarot.js';
// import * as quoteCommand from './interactions/commands/quote.js'; // 註解台詞迷因
// import * as spinCommand from './interactions/commands/spin.js'; // 註解輪盤

interface Command {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: any) => Promise<void>;
}

// ─── Client Setup ──────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Build command registry
const commands = new Collection<string, Command>();

commands.set(rollCommand.data.name, rollCommand);
commands.set(choiceCommand.data.name, choiceCommand);
commands.set(shuffleCommand.data.name, shuffleCommand);

commands.set(tarotModule.dailyTarotData.name, {
  data: tarotModule.dailyTarotData,
  execute: (interaction) => handleTarotDraw(interaction, 'single'),
});
commands.set(tarotModule.tarot3Data.name, {
  data: tarotModule.tarot3Data,
  execute: (interaction) => handleTarotDraw(interaction, 'three'),
});

// commands.set(quoteCommand.data.name, quoteCommand); // 註解台詞迷因
// commands.set(spinCommand.data.name, spinCommand); // 註解輪盤

// ─── Event: Ready ─────────────────────────────────────────────────────────────

client.once(Events.ClientReady, (readyClient) => {
  console.log(`\n🐟 YuiKo (小魚子) 已上線！`);
  console.log(`✅ 登入身份：${readyClient.user.tag}`);
  console.log(`📡 已連接 ${readyClient.guilds.cache.size} 個伺服器`);
  console.log(`🎲 已載入 ${commands.size} 個指令\n`);

  readyClient.user.setActivity('🎲 1d100 | 隨機 | 排序', { type: 0 });
});

// ─── Event: Interaction (Slash & Buttons) ──────────────────────────────────────

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  // 1. Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);

    if (!command) {
      console.warn(`⚠️  收到未知指令：${interaction.commandName}`);
      await interaction.reply({
        content: '❌ 未知指令，請聯絡管理員。',
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ 執行指令 /${interaction.commandName} 時發生錯誤：`, error);

      const errorMsg = '⚠️ 執行指令時發生錯誤，請稍後再試。';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMsg, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMsg, ephemeral: true });
      }
    }
    return;
  }

  // 2. Button Interactions (Tarot Buttons)
  if (interaction.isButton()) {
    if (interaction.customId === 'tarot_single') {
      await handleTarotDraw(interaction, 'single');
    } else if (interaction.customId === 'tarot_three') {
      await handleTarotDraw(interaction, 'three');
    }
    return;
  }
});

// ─── Event: Plain Text Commands ────────────────────────────────────────────────

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // 1. Text Dice Rolling (r 1d100 OR direct 1d100, 2d6+3, 4d6kh3, 5d10>6)
  let diceExpression: string | null = null;

  const rShortcutMatch = content.match(/^r\s+([0-9]+[dD][0-9]+.*)$/i);
  const directDiceMatch = content.match(/^([0-9]+[dD][0-9]+(?:kh[0-9]+|kl[0-9]+|>[0-9]+)?(?:[+-][0-9]+)?)$/i);

  if (rShortcutMatch) {
    diceExpression = rShortcutMatch[1]!;
  } else if (directDiceMatch) {
    diceExpression = directDiceMatch[1]!;
  }

  if (diceExpression) {
    try {
      const result = roll(diceExpression);

      const embed = rollCommand.buildRollEmbed(diceExpression, result, message.author.displayName);

      await message.reply({ embeds: [embed] });
      return;
    } catch {
      return;
    }
  }

  // 2. Text Choice (隨機 壽司 披薩 漢堡)
  const choiceMatch = content.match(/^隨機\s+(.+)$/);
  if (choiceMatch) {
    try {
      const rawOptions = choiceMatch[1]!;
      const options = parseOptions(rawOptions);
      const result = pick(options);

      const embed = choiceCommand.buildChoiceEmbed(result.picked, options, message.author.displayName);

      await message.reply({ embeds: [embed] });
      return;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '未知錯誤';
      await message.reply(errMsg);
      return;
    }
  }

  // 3. Text Shuffle (排序 選手A 選手B 選手C)
  const shuffleMatch = content.match(/^排序\s+(.+)$/);
  if (shuffleMatch) {
    try {
      const rawOptions = shuffleMatch[1]!;
      const options = parseOptions(rawOptions);
      const result = shuffle(options);

      const embed = shuffleCommand.buildShuffleEmbed(result.shuffled, message.author.displayName);

      await message.reply({ embeds: [embed] });
      return;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '未知錯誤';
      await message.reply(errMsg);
      return;
    }
  }

  /*
  // 4. 輪盤文字指令（已註解停用）
  // const spinMatch = content.match(/^輪盤\s+(.+)$/);
  */
});

// ─── Health-Check HTTP Server ─────────────────────────────────────────────────

const app = express();

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    bot: client.user?.tag ?? 'connecting...',
    uptime: Math.floor(process.uptime()),
    guilds: client.guilds.cache.size,
  });
});

app.get('/', (_req, res) => {
  res.status(200).send('🐟 YuiKo (小魚子) Discord Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 Health-check 伺服器啟動於 port ${PORT}`);
});

// ─── Login ────────────────────────────────────────────────────────────────────

client.login(TOKEN).catch((error: unknown) => {
  console.error('❌ Discord 登入失敗：', error);
  process.exit(1);
});
