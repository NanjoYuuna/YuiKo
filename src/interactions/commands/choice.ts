import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { parseOptions, pick } from '../../services/ChoiceService.js';

export const data = new SlashCommandBuilder()
  .setName('choice')
  .setDescription('🎯 隨機抽一個選項 (例如: 壽司 披薩 漢堡)')
  .addStringOption(opt =>
    opt
      .setName('選項')
      .setDescription('用空格分隔的選項，例如：壽司 披薩 漢堡')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const input = interaction.options.getString('選項', true);

  try {
    const options = parseOptions(input);
    const result = pick(options);

    const embed = new EmbedBuilder()
      .setColor(0xF59E0B)
      .setTitle('🎯 命運之手的選擇')
      .addFields(
        {
          name: '✨ 選出結果',
          value: `## **${result.picked}**`,
          inline: false,
        },
        {
          name: '📋 所有選項',
          value: options.map(o => o === result.picked ? `> **${o}** ←` : o).join('　'),
          inline: false,
        }
      )
      .setFooter({ text: `${options.length} 個選項　由 ${interaction.user.displayName} 發起` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    await interaction.reply({ content: message, ephemeral: true });
  }
}
