import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { roll } from '../../services/DiceService.js';

export const data = new SlashCommandBuilder()
  .setName('roll')
  .setDescription('🎲 擲骰子 (例如: 1d100, 2d6+3, 4d6kh3)')
  .addStringOption(option =>
    option
      .setName('算式')
      .setDescription('骰子算式，例如：1d100, 2d6+3, 4d6kh3')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const expression = interaction.options.getString('算式', true);

  try {
    const result = roll(expression);

    const embed = new EmbedBuilder()
      .setColor(0x00A8E8)
      .setTitle('🎲 擲骰結果')
      .setDescription(`\`\`\`\n${expression}\n\`\`\``)
      .addFields(
        {
          name: '🎯 骰出結果',
          value: result.breakdown,
          inline: false,
        },
        {
          name: result.successCount !== undefined ? '✅ 成功數' : '📊 最終總和',
          value: `# **${result.total}**`,
          inline: true,
        },
        {
          name: '🎲 骰子顆數',
          value: `${result.rolls.length} 顆 d${expression.match(/d(\d+)/i)?.[1] ?? '?'}`,
          inline: true,
        }
      )
      .setFooter({ text: `由 ${interaction.user.displayName} 擲出` })
      .setTimestamp();

    if (result.modifier !== 0) {
      embed.addFields({
        name: '➕ 修正值',
        value: result.modifier > 0 ? `+${result.modifier}` : `${result.modifier}`,
        inline: true,
      });
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    await interaction.reply({ content: message, ephemeral: true });
  }
}
