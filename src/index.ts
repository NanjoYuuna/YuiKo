// ─── Global Error Handlers ───────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('🚨 [unhandledRejection]', reason);
  // 不呼叫 process.exit — 避免 Render 重啟循環觸發 Discord rate limit
});
process.on('uncaughtException', (error) => {
  console.error('🚨 [uncaughtException]', error);
  // 不呼叫 process.exit — 避免 Render 重啟循環觸發 Discord rate limit
});

import { Client, GatewayIntentBits, Collection, Events, Interaction, Message, EmbedBuilder } from 'discord.js';
import express from 'express';
import { TOKEN, PORT } from './config.js';
import { roll, parseDiceInput } from './services/DiceService.js';
import { parseOptions, pick, shuffle } from './services/ChoiceService.js';
import { getByKeyword, getRandom } from './services/MemeService.js';
import { handleTarotDraw, handleTarotDrawText } from './interactions/commands/tarot.js';

// ─── Command Loader ────────────────────────────────────────────────────────────

import * as rollCommand from './interactions/commands/roll.js';
import * as choiceCommand from './interactions/commands/choice.js';
import * as shuffleCommand from './interactions/commands/shuffle.js';
import * as tarotModule from './interactions/commands/tarot.js';
import * as tempDemoModule from './commands/tempDemo.js';
import * as groupModule from './interactions/commands/group.js';
import * as quoteCommand from './interactions/commands/quote.js';
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
    GatewayIntentBits.GuildVoiceStates,
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

commands.set(tempDemoModule.choiceDemoData.name, {
  data: tempDemoModule.choiceDemoData,
  execute: tempDemoModule.executeChoiceDemo,
});
commands.set(tempDemoModule.rollDemoData.name, {
  data: tempDemoModule.rollDemoData,
  execute: tempDemoModule.executeRollDemo,
});

commands.set(groupModule.groupVoiceData.name, {
  data: groupModule.groupVoiceData,
  execute: groupModule.executeGroupVoice,
});
commands.set(groupModule.groupListData.name, {
  data: groupModule.groupListData,
  execute: groupModule.executeGroupList,
});

commands.set(quoteCommand.data.name, quoteCommand);
// commands.set(spinCommand.data.name, spinCommand); // 註解輪盤

// ─── Event: Ready ─────────────────────────────────────────────────────────────

client.once(Events.ClientReady, (readyClient) => {
  console.log(`\n🐟 YuiKo (小魚子) 已上線！`);
  console.log(`✅ 登入身份：${readyClient.user.tag}`);
  console.log(`📡 已連接 ${readyClient.guilds.cache.size} 個伺服器`);
  console.log(`🎲 已載入 ${commands.size} 個指令\n`);

  // 定義要輪播的狀態清單
  const activities = [
    { name: '/roll 擲骰子', type: 0 }, // 0: Playing (正在玩)
    { name: '/daily_tarot 每日塔羅', type: 0 },
    { name: '隨機 / 排序 決定困難症', type: 0 },
    { name: `服務 ${readyClient.guilds.cache.size} 個伺服器`, type: 3 }, // 3: Watching (正在看)
  ];

  let currentIndex = 0;

  // 每一小時或每 30 秒切換一次（建議設 1~5 分鐘，避免觸發 API 速率限制）
  setInterval(() => {
    const activity = activities[currentIndex];
    readyClient.user.setActivity(activity.name, { type: activity.type });
    currentIndex = (currentIndex + 1) % activities.length;
  }, 2 * 60 * 1000); // 每 2 分鐘切換一次

  // 剛上線時先設定第一個
  readyClient.user.setActivity(activities[0].name, { type: activities[0].type });
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

  // 2. Button Interactions (Tarot Buttons & Group Reroll)
  if (interaction.isButton()) {
    try {
      if (interaction.customId === 'tarot_single') {
        await handleTarotDraw(interaction, 'single');
      } else if (interaction.customId === 'tarot_three') {
        await handleTarotDraw(interaction, 'three');
      } else if (interaction.customId === 'reroll_group') {
        await groupModule.handleGroupRerollButton(interaction);
      }
    } catch (error) {
      console.error(`❌ 按鈕互動時發生錯誤 (${interaction.customId})：`, error);
      const errorMsg = '⚠️ 處理按鈕時發生錯誤，請稍後再試。';
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: errorMsg });
      } else {
        await interaction.reply({ content: errorMsg, ephemeral: true });
      }
    }
    return;
  }

  // 3. Select Menu Interactions (Temp Demo Select Menus)
  if (interaction.isStringSelectMenu()) {
    try {
      if (
        interaction.customId === 'choice_demo_select' ||
        interaction.customId === 'roll_demo_select'
      ) {
        await tempDemoModule.handleTempDemoSelect(interaction);
      }
    } catch (error) {
      console.error(`❌ 下拉選單互動時發生錯誤 (${interaction.customId})：`, error);
    }
    return;
  }
});

// ─── Event: Plain Text Commands ────────────────────────────────────────────────

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // 1. Text Dice Rolling (只支援: 1d20/1D20, 1d20 先攻, /r 1d20, /roll 1D20 先攻)
  let rawDiceInput: string | null = null;

  const rShortcutMatch = content.match(/^(?:\/roll|\/r)\s+(.+)$/i);
  const directDiceMatch = content.match(/^(\d*d\d+(?:kh\d+|kl\d+|>\d+)?(?:\s*[+-]\s*\d+)?)(?:\s+.*)?$/i);

  if (rShortcutMatch) {
    rawDiceInput = rShortcutMatch[1]!;
  } else if (directDiceMatch) {
    rawDiceInput = content;
  }

  if (rawDiceInput) {
    try {
      const { expression, reason } = parseDiceInput(rawDiceInput);
      const result = roll(expression);
      const embed = rollCommand.buildRollEmbed(expression, result, message.author.displayName, reason);
      await message.reply({ embeds: [embed] });
      return;
    } catch (error) {
      if (rShortcutMatch) {
        const errMsg = error instanceof Error ? error.message : '未知錯誤';
        await message.reply(errMsg);
      }
      return;
    }
  }

  // 2. Text Choice (只支援: 隨機 A B, /choice A B)
  const choiceMatch = content.match(/^(?:隨機|\/choice)\s+(.+)$/);
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

  // 3. Text Shuffle (只支援: 排序 A B, /shuffle A B)
  const shuffleMatch = content.match(/^(?:排序|\/shuffle)\s+(.+)$/);
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

  // 4. Text Tarot Commands (只支援: 每日塔羅, /daily_tarot, 時間塔羅, /tarot_3)
  if (content === '每日塔羅' || content === '/daily_tarot') {
    await handleTarotDrawText(message, 'single');
    return;
  }

  if (content === '時間塔羅' || content === '/tarot_3') {
    await handleTarotDrawText(message, 'three');
    return;
  }

  // 5. Temp Demo Commands (隨機樣板, /choice_demo, 擲骰樣板, /roll_demo)
  if (content === '隨機樣板' || content === '/choice_demo') {
    await tempDemoModule.executeChoiceDemoText(message);
    return;
  }

  if (content === '擲骰樣板' || content === '/roll_demo') {
    await tempDemoModule.executeRollDemoText(message);
    return;
  }

  // 6. Text Grouping Commands (分組 名單 隊伍數 / 語音分組 隊伍數)
  const groupListMatch = content.match(/^(?:\/group_list|\/分組|分組)\s+(.+)\s+(\d+)$/i);
  if (groupListMatch) {
    const rawMembers = groupListMatch[1]!;
    const teamCount = parseInt(groupListMatch[2]!, 10);
    await groupModule.executeGroupListText(message, rawMembers, teamCount);
    return;
  }

  const groupVoiceMatch = content.match(/^(?:\/group_voice|\/語音分組|語音分組)\s+(\d+)$/i);
  if (groupVoiceMatch) {
    const teamCount = parseInt(groupVoiceMatch[1]!, 10);
    await groupModule.executeGroupVoiceText(message, teamCount);
    return;
  }

  // 7. Text Meme/Quote Commands (支援: . 關鍵字, .關鍵字, /quote 關鍵字)
  const dotMemeMatch = content.match(/^(?:\/quote|\.)\s*(.*)$/i);
  if (dotMemeMatch) {
    const isSlashQuote = content.toLowerCase().startsWith('/quote');
    const rawKw = dotMemeMatch[1]!.trim();

    // 如果是單獨的多個點 (例如 ... 或 ..)，且不是 /quote，則忽略避免干擾一般聊天
    if (!isSlashQuote && /^[\.\s]+$/.test(rawKw) && rawKw !== '') {
      return;
    }

    const quote = rawKw && rawKw !== '隨機' ? await getByKeyword(rawKw) : await getRandom();

    // 如果找不到梗圖或沒有圖片 URL，不進行任何回應
    if (!quote || !quote.imageUrl) {
      return;
    }

    // 直接發送圖片網址，Discord 會自動載入預覽圖片且不會留下空白 Embed 框
    await message.reply({ content: quote.imageUrl });
    return;
  }
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

// ─── Login with Exponential Backoff ──────────────────────────────────────────────

// 監聽 discord.js 內部錯誤（不退出程式）
client.on(Events.Error, (error) => {
  console.error('❌ [Discord Client Error]', error);
});

/**
 * 登入 Discord，失敗時以指數退避重試（防止觸發 rate limit）
 * 延遲順序：1s → 2s → 4s → 8s → ... 最大 5 分鐘
 */
async function loginWithBackoff(attempt = 1): Promise<void> {
  try {
    await client.login(TOKEN);
  } catch (error) {
    const MAX_DELAY_MS = 5 * 60 * 1000; // 5 分鐘
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), MAX_DELAY_MS);
    console.error(`❌ Discord 登入失敗（第 ${attempt} 次），${delay / 1000} 秒後重試：`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    await loginWithBackoff(attempt + 1);
  }
}

loginWithBackoff();
