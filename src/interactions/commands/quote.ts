import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { getByKeyword, getRandom } from '../../services/MemeService.js';

export const data = new SlashCommandBuilder()
  .setName('quote')
  .setDescription('💬 搜尋並發送經典跑團台詞　用法：/quote flag　或　/quote（隨機）')
  .addStringOption(opt =>
    opt
      .setName('q')
      .setDescription('搜尋關鍵字，例如：flag、骰子、gm（不輸入則隨機）')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const keyword = interaction.options.getString('q');

  let quote = keyword ? getByKeyword(keyword) : getRandom();

  if (!quote) {
    quote = getRandom();
    await interaction.reply({
      content: `🔍 找不到「**${keyword}**」的相關台詞，改為隨機抽取！`,
      embeds: [buildEmbed(quote, interaction.user.displayName)],
    });
    return;
  }

  const header = keyword
    ? `🔍 關鍵字「**${keyword}**」的搜尋結果`
    : '🎲 隨機台詞！';

  await interaction.reply({
    content: header,
    embeds: [buildEmbed(quote, interaction.user.displayName)],
  });
}

function buildEmbed(
  quote: { text: string; description: string; imageUrl: string; tags: string[] },
  username: string
) {
  const embed = new EmbedBuilder()
    .setColor(0x10B981)
    .setTitle(`💬 "${quote.text}"`)
    .setDescription(quote.description)
    .setFooter({
      text: `標籤：${quote.tags.join('、')}　由 ${username} 查詢`,
    })
    .setTimestamp();

  if (quote.imageUrl && !quote.imageUrl.includes('placeholder')) {
    embed.setImage(quote.imageUrl);
  }

  return embed;
}
