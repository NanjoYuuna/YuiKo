import { REST, Routes } from 'discord.js';
import { TOKEN, CLIENT_ID, GUILD_ID } from '../config.js';
import { data as rollData } from './commands/roll.js';
import { data as choiceData } from './commands/choice.js';
import { data as shuffleData } from './commands/shuffle.js';
import { dailyTarotData, tarot3Data } from './commands/tarot.js';
import { choiceDemoData, rollDemoData } from '../commands/tempDemo.js';
import { groupVoiceData, groupListData } from './commands/group.js';

const commands = [
  rollData.toJSON(),
  choiceData.toJSON(),
  shuffleData.toJSON(),
  dailyTarotData.toJSON(),
  tarot3Data.toJSON(),
  choiceDemoData.toJSON(),
  rollDemoData.toJSON(),
  groupVoiceData.toJSON(),
  groupListData.toJSON(),
];

const rest = new REST().setToken(TOKEN);

(async () => {
  try {
    console.log(`🔄 開始全域註冊 ${commands.length} 個 Slash Commands...`);

    // 1. 強制註冊「全域指令」（讓名片產生按鈕）
    const globalData = await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log(`✅ 成功全域註冊了 ${(globalData as unknown[]).length} 個指令！（名片按鈕同步中，需時約 10~30 分鐘）`);

    // 2. 清除特定 Guild 的舊指令（避免選單出現重複的指令）
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: [] }
      );
      console.log(`🧹 已清空特定伺服器 (${GUILD_ID}) 的本地測試指令，避免與全域指令重複。`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 指令註冊失敗：', error);
    process.exit(1);
  }
})();