import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  MessageFlags,
} from 'discord.js';
import { roll, parseDiceInput, DiceResult } from '../../services/DiceService.js';

export const data = new SlashCommandBuilder()
  .setName('roll')
  .setDescription('🎲 擲骰子 (例如: 1d100, 2d6+3, 4d6kh3)')
  .addStringOption(option =>
    option
      .setName('expression')
      .setDescription('骰子算式或帶有標題的算式，例如：1d100, 1d20 先攻, 2d6+3 攻擊')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('擲骰原因 / 標題 (可選，例如：先攻、敏捷檢定)')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const rawExpression = interaction.options.getString('expression', true);
  const explicitReason = interaction.options.getString('reason') ?? undefined;

  try {
    const { expression, reason: parsedReason } = parseDiceInput(rawExpression);
    const reason = explicitReason ?? parsedReason;

    const result = roll(expression);
    const embed = buildRollEmbed(expression, result, interaction.user.displayName, reason);

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
  }
}

export function buildRollEmbed(expression: string, result: DiceResult, userName: string, reason?: string): EmbedBuilder {
  const title = reason ? `🎲 擲骰 ： ${reason}` : '🎲 擲骰';

  return new EmbedBuilder()
    .setColor(0x00A8E8)
    .setTitle(title)
    .setDescription(
      `> **\` ${expression} \`**\n` +
      `## ➔ **${result.total}**\n` +
      `${result.breakdown}`
    )
    .setFooter({ text: `由 ${userName} 擲出` })
    .setTimestamp();
}