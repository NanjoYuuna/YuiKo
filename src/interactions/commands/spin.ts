import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { spin } from '../../services/RouletteService.js';
import { parseOptions } from '../../services/ChoiceService.js';

export const data = new SlashCommandBuilder()
  .setName('spin')
  .setDescription('🎰 啟動動態輪盤！　用法：/spin 壽司 披薩 漢堡')
  .addStringOption(opt =>
    opt
      .setName('選項')
      .setDescription('用空格分隔的選項，例如：壽司 披薩 漢堡 炸雞')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const input = interaction.options.getString('選項', true);

  try {
    const options = parseOptions(input);
    const { frames, result } = spin(options);

    await interaction.deferReply();

    const buildAnimFrame = (content: string, frameNum: number) =>
      new EmbedBuilder()
        .setColor(0xF97316)
        .setTitle(`🎰 輪盤旋轉中...`)
        .setDescription(content)
        .setFooter({ text: `第 ${frameNum} 幀　${options.length} 個選項` });

    const buildResultEmbed = (winner: string) =>
      new EmbedBuilder()
        .setColor(0x22C55E)
        .setTitle('🎉 輪盤停止！')
        .setDescription(
          `┌──────────────────────┐\n` +
          `│                      │\n` +
          `│   🏆  **${winner.padEnd(10)}**  🏆   │\n` +
          `│                      │\n` +
          `└──────────────────────┘`
        )
        .addFields({
          name: '🎊 命運選擇了',
          value: `## **${winner}**`,
          inline: false,
        })
        .setFooter({ text: `由 ${interaction.user.displayName} 發起　共 ${options.length} 個選項` })
        .setTimestamp();

    await interaction.editReply({ embeds: [buildAnimFrame(frames[0]!, 1)] });
    await delay(1200);
    await interaction.editReply({ embeds: [buildAnimFrame(frames[1]!, 2)] });
    await delay(1200);
    await interaction.editReply({ embeds: [buildAnimFrame(frames[2]!, 3)] });
    await delay(1500);
    await interaction.editReply({
      content: '🎉🎊🎉 **恭喜！** 🎉🎊🎉',
      embeds: [buildResultEmbed(result)],
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    if (interaction.deferred) {
      await interaction.editReply({ content: message });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
