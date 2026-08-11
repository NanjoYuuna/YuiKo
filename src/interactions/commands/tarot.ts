import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
} from 'discord.js';
import { drawTarot } from '../../services/FortuneService.js';

// ─── Slash Commands Definition ────────────────────────────────────────────────

export const dailyTarotData = new SlashCommandBuilder()
  .setName('daily_tarot')
  .setDescription('🎴 每日塔羅（單牌洞察）');

export const tarot3Data = new SlashCommandBuilder()
  .setName('tarot_3')
  .setDescription('🔮 三牌陣（過去・現在・未來）');

// ─── Button Component Helper ──────────────────────────────────────────────────

export function getTarotButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('tarot_single')
      .setLabel('🎴 每日塔羅 (單牌)')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('tarot_three')
      .setLabel('🔮 三牌陣 (三牌)')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ─── Tarot Execution Helper ───────────────────────────────────────────────────

export async function handleTarotDraw(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  type: 'single' | 'three'
): Promise<void> {
  const result = drawTarot(type);
  const buttons = getTarotButtons();

  if (type === 'single') {
    const card = result.cards[0]!;
    const orientation = card.isReversed ? '🔄 逆位' : '⬆️ 正位';

    const embed = new EmbedBuilder()
      .setColor(card.isReversed ? 0x6B21A8 : 0x7C3AED)
      .setTitle(`🎴 ${card.nameZh}　${card.isReversed ? '（逆位）' : '（正位）'}`)
      .setDescription(`*${card.name}　${orientation}*`)
      .addFields(
        {
          name: '📖 牌義解讀',
          value: card.meaning,
          inline: false,
        },
        {
          name: '🃏 牌組',
          value: card.arcana === 'major' ? '大阿爾克那' : `小阿爾克那・${getArcanaName(card.arcana)}`,
          inline: true,
        },
        {
          name: '🔢 編號',
          value: card.number,
          inline: true,
        }
      )
      .setImage(card.imageUrl)
      .setFooter({ text: `由 ${interaction.user.displayName} 抽取` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [buttons] });

  } else {
    const labels = result.spreadLabel!;
    const embeds = result.cards.map((card, i) => {
      const orientation = card.isReversed ? '🔄 逆位' : '⬆️ 正位';
      const colors = [0x1D4ED8, 0x7C3AED, 0xDC2626];

      return new EmbedBuilder()
        .setColor(colors[i]!)
        .setTitle(`${['🌙', '☀️', '⭐'][i]!} ${labels[i]!}：${card.nameZh}　${card.isReversed ? '（逆位）' : '（正位）'}`)
        .setDescription(`*${card.name}　${orientation}*`)
        .addFields({ name: '📖 牌義解讀', value: card.meaning, inline: false })
        .setThumbnail(card.imageUrl);
    });

    const headerEmbed = new EmbedBuilder()
      .setColor(0x1E1B4B)
      .setTitle('🎴 三牌陣　過去・現在・未來')
      .setDescription(`*命運的三個時刻，為 ${interaction.user.displayName} 徐徐展開...*`)
      .setTimestamp();

    await interaction.reply({ embeds: [headerEmbed, ...embeds], components: [buttons] });
  }
}

function getArcanaName(arcana: string): string {
  const names: Record<string, string> = {
    wands: '權杖',
    cups: '聖杯',
    swords: '寶劍',
    pentacles: '五角星',
  };
  return names[arcana] ?? arcana;
}
