import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { getByKeyword, getRandom, Quote } from '../../services/MemeService.js';

export const data = new SlashCommandBuilder()
  .setName('quote')
  .setDescription('💬 搜尋 MyGO 梗圖 / 台詞　用法：/quote 春日影 或 . 關鍵字')
  .addStringOption(opt =>
    opt
      .setName('q')
      .setDescription('搜尋關鍵字，例如：春日影、爽世、一輩子（不輸入則隨機）')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const keyword = interaction.options.getString('q');

  const quote = keyword ? await getByKeyword(keyword) : await getRandom();

  if (!quote || !quote.imageUrl) {
    await interaction.reply({
      content: `🔍 找不到「**${keyword || ''}**」的相關梗圖。`,
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x2B2D31)
    .setImage(quote.imageUrl);

  await interaction.reply({ embeds: [embed] });
}

export function buildEmbed(
  quote: Quote,
  username: string
) {
  const embed = new EmbedBuilder()
    .setColor(0x10B981)
    .setTitle(`💬 "${quote.text}"`)
    .setFooter({
      text: quote.tags.length > 0 ? `標籤：${quote.tags.join('、')}　由 ${username} 查詢` : `由 ${username} 查詢`,
    })
    .setTimestamp();

  if (quote.description) {
    embed.setDescription(quote.description);
  }

  if (quote.imageUrl && !quote.imageUrl.includes('placeholder')) {
    embed.setImage(quote.imageUrl);
  }

  return embed;
}
