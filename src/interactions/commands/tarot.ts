import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  AttachmentBuilder,
} from 'discord.js';
import {
  drawTarot,
  getCardLocalPath,
  getAttachmentFileName,
} from '../../services/FortuneService.js';
import { getCardImageBuffer } from '../../services/imageHelper.js';

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
    const localPath = getCardLocalPath(card);
    const fileName = getAttachmentFileName(card);

    // 取得 (必要時轉 180 度) 圖片 Buffer 並打包附件
    const imageBuffer = await getCardImageBuffer(localPath, card.isReversed);
    const attachment = new AttachmentBuilder(imageBuffer, { name: fileName });

    // 色彩區分：正位紫藍色 (0x7C3AED)，逆位深紅/暗紫色 (0x991B1B)
    const embedColor = card.isReversed ? 0x991B1B : 0x7C3AED;
    const titleEmoji = card.isReversed ? '🔄' : '🎴';

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${titleEmoji} ${card.nameZh}（${card.isReversed ? '逆位' : '正位'}）`)
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
      .setImage(`attachment://${fileName}`)
      .setFooter({ text: `由 ${interaction.user.displayName} 抽取` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      files: [attachment],
      components: [buttons],
    });

  } else {
    const labels = result.spreadLabel!;

    // 使用 Promise.all() 平行處理 3 張圖片的旋轉與 Buffer 轉換
    const cardResults = await Promise.all(
      result.cards.map(async (card) => {
        const localPath = getCardLocalPath(card);
        const fileName = getAttachmentFileName(card);
        const buffer = await getCardImageBuffer(localPath, card.isReversed);
        const attachment = new AttachmentBuilder(buffer, { name: fileName });
        return { card, fileName, attachment };
      })
    );

    const embeds = cardResults.map(({ card, fileName }, i) => {
      const orientation = card.isReversed ? '🔄 逆位' : '⬆️ 正位';
      const titleEmoji = card.isReversed ? '🔄' : ['🌙', '☀️', '⭐'][i]!;
      const embedColor = card.isReversed ? 0x991B1B : [0x1D4ED8, 0x7C3AED, 0x059669][i]!;

      return new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`${titleEmoji} ${labels[i]!}：${card.nameZh}（${card.isReversed ? '逆位' : '正位'}）`)
        .setDescription(`*${card.name}　${orientation}*`)
        .addFields({ name: '📖 牌義解讀', value: card.meaning, inline: false })
        .setThumbnail(`attachment://${fileName}`);
    });

    const headerEmbed = new EmbedBuilder()
      .setColor(0x1E1B4B)
      .setTitle('🎴 三牌陣　過去・現在・未來')
      .setDescription(`*命運的三個時刻，為 ${interaction.user.displayName} 徐徐展開...*`)
      .setTimestamp();

    const attachments = cardResults.map((item) => item.attachment);

    await interaction.reply({
      embeds: [headerEmbed, ...embeds],
      files: attachments,
      components: [buttons],
    });
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

