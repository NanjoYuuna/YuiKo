import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  AttachmentBuilder,
  Message,
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
  .setDescription('🎴 每日塔羅');

export const tarot3Data = new SlashCommandBuilder()
  .setName('tarot_3')
  .setDescription('🕒 時間塔羅');

// ─── Button Component Helper ──────────────────────────────────────────────────

export function getTarotButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('tarot_single')
      .setLabel('🎴 每日塔羅')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('tarot_three')
      .setLabel('🕒 時間塔羅')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ─── Core Payload Generator (抽出共同核心邏輯) ───────────────────────────────

async function buildTarotPayload(type: 'single' | 'three', displayName: string, userId: string) {
  const result = drawTarot(type);
  const buttons = getTarotButtons();

  if (type === 'single') {
    const card = result.cards[0]!;
    const orientation = card.isReversed ? '🌙 逆位' : '☀️ 正位';
    const localPath = getCardLocalPath(card);
    const fileName = getAttachmentFileName(card);

    const imageBuffer = await getCardImageBuffer(localPath, card.isReversed);
    const attachment = new AttachmentBuilder(imageBuffer, { name: fileName });

    const embedColor = card.isReversed ? 0x991B1B : 0x7C3AED;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`🎴 ${card.nameZh}（${card.isReversed ? '逆位' : '正位'}）`)
      .setDescription(`*${card.name} ${orientation}*`)
      .setImage(`attachment://${fileName}`)
      .setFooter({ text: `由 ${displayName} 抽取` })
      .setTimestamp();

    return {
      content: `<@${userId}>`,
      embeds: [embed],
      files: [attachment],
      components: [buttons],
    };
  } else {
    const labels = result.spreadLabel!;

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
      const orientation = card.isReversed ? '🌙 逆位' : '☀️ 正位';
      const titleEmoji = ['⬅️', '⬇️', '➡️'][i]!;
      const embedColor = card.isReversed ? 0x991B1B : [0x1D4ED8, 0x7C3AED, 0x059669][i]!;

      return new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`${titleEmoji} ${labels[i]!}：${card.nameZh}（${card.isReversed ? '逆位' : '正位'}）`)
        .setDescription(`*${card.name} ${orientation}*`)
        .setThumbnail(`attachment://${fileName}`);
    });

    const headerEmbed = new EmbedBuilder()
      .setColor(0x1E1B4B)
      .setTitle('🎴 時間塔羅')
      .setDescription('*過去・現在・未來...*')
      .setFooter({ text: `由 ${displayName} 抽取` })
      .setTimestamp();

    return {
      content: `<@${userId}>`,
      embeds: [headerEmbed, ...embeds],
      files: cardResults.map((item) => item.attachment),
      components: [buttons],
    };
  }
}

// ─── Interaction Execution Helper ─────────────────────────────────────────────

export async function handleTarotDraw(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  type: 'single' | 'three'
): Promise<void> {
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply();
  }

  try {
    const payload = await buildTarotPayload(type, interaction.user.displayName, interaction.user.id);
    await interaction.editReply(payload);
  } catch (error) {
    console.error('❌ [TarotDraw] 處理塔羅牌抽牌時發生錯誤：', error);
    const errorMsg = '⚠️ 處理塔羅牌抽牌時發生錯誤，請稍後再試。';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: errorMsg });
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  }
}

// ─── Text Message Execution Helper ───────────────────────────────────────────

export async function handleTarotDrawText(
  message: Message,
  type: 'single' | 'three'
): Promise<void> {
  try {
    const payload = await buildTarotPayload(type, message.author.displayName, message.author.id);
    await message.reply(payload);
  } catch (error) {
    console.error('❌ [TarotDrawText] 處理塔羅牌抽牌時發生錯誤：', error);
    await message.reply('⚠️ 處理塔羅牌抽牌時發生錯誤，請稍後再試。');
  }
}