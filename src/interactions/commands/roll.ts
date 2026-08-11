import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  MessageFlags,
} from 'discord.js';
import { roll, DiceResult } from '../../services/DiceService.js';

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
    const embed = buildRollEmbed(expression, result, interaction.user.displayName);

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
  }
}

export function buildRollEmbed(expression: string, result: DiceResult, userName: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x00A8E8)
    .setTitle('🎲 擲骰結果')
    .setDescription(
      `> **\` ${expression} \`**\n\n` +
      `### 👉 **${result.total}**`
    )
    .addFields({
      name: '🎲 擲骰過程',
      value: result.breakdown,
      inline: false,
    })
    .setFooter({ text: `由 ${userName} 擲出` })
    .setTimestamp();
}