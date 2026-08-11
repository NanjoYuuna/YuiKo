import { REST, Routes } from 'discord.js';
import { TOKEN, CLIENT_ID, GUILD_ID } from '../config.js';
import { data as rollData } from './commands/roll.js';
import { data as choiceData } from './commands/choice.js';
import { data as shuffleData } from './commands/shuffle.js';
import { dailyTarotData, tarot3Data } from './commands/tarot.js';
// import { data as quoteData } from './commands/quote.js'; // 註解台詞迷因
import { data as spinData } from './commands/spin.js';

const commands = [
  rollData.toJSON(),
  choiceData.toJSON(),
  shuffleData.toJSON(),
  dailyTarotData.toJSON(),
  tarot3Data.toJSON(),
  // quoteData.toJSON(), // 註解台詞迷因
  spinData.toJSON(),
];

const rest = new REST().setToken(TOKEN);

(async () => {
  try {
    console.log(`🔄 開始註冊 ${commands.length} 個 Slash Commands...`);

    if (GUILD_ID) {
      const data = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`✅ 成功在伺服器 (${GUILD_ID}) 註冊了 ${(data as unknown[]).length} 個指令！（即時生效）`);
    } else {
      const data = await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log(`✅ 成功全域註冊了 ${(data as unknown[]).length} 個指令！（生效時間最長 1 小時）`);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ 指令註冊失敗：', error);
    process.exit(1);
  }
})();
