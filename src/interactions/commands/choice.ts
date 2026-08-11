import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { parseOptions, pick } from '../../services/ChoiceService.js';

export const data = new SlashCommandBuilder()
  .setName('choice')
  .setDescription('隨機抽一個選項 (例如: 壽司 披薩 漢堡)')
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

    const embed = buildChoiceEmbed(result.picked, options, interaction.user.displayName);

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    await interaction.reply({ content: message, ephemeral: true });
  }
}

export function buildChoiceEmbed(picked: string, options: string[], userName: string): EmbedBuilder {
  const optionsText = options.join(' ');

  return new EmbedBuilder()
    .setColor(0xF59E0B)
    .setTitle('🔀 隨機選擇')
    .setDescription(
      `## 👉 ${picked}\n\n` +
      `**選項**\n` +
      `\`\`\`\n${optionsText}\n\`\`\``
    )
    .setFooter({ text: `${options.length} 個選項 由 ${userName} 發起` })
    .setTimestamp();
}
