import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { parseOptions, shuffle } from '../../services/ChoiceService.js';

export const data = new SlashCommandBuilder()
  .setName('shuffle')
  .setDescription('🔀 將選項重新洗牌排序 (例如: 選手A 選手B 選手C)')
  .addStringOption(opt =>
    opt
      .setName('選項')
      .setDescription('用空格分隔的選項，例如：選手A 選手B 選手C')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const input = interaction.options.getString('選項', true);

  try {
    const options = parseOptions(input);
    const result = shuffle(options);

    const embed = new EmbedBuilder()
      .setColor(0x8B5CF6)
      .setTitle('🔀 洗牌完成！')
      .addFields({
        name: '📋 新順序',
        value: result.display,
        inline: false,
      })
      .setFooter({ text: `${options.length} 個選項　由 ${interaction.user.displayName} 發起` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知錯誤';
    await interaction.reply({ content: message, ephemeral: true });
  }
}
