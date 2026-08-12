import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

// 隊伍色彩標記清單
const TEAM_COLOR_PREFIXES = [
  '🔴 紅隊',
  '🔵 藍隊',
  '🟢 綠隊',
  '🟡 黃隊',
  '🟣 紫隊',
  '🟠 橘隊',
  '🟤 棕隊',
  '⚪ 白隊',
  '⬛ 黑隊',
];

/**
 * 取得第 index 個隊伍的名稱
 */
export function getTeamName(index: number): string {
  if (index < TEAM_COLOR_PREFIXES.length) {
    return TEAM_COLOR_PREFIXES[index]!;
  }
  return `📦 第 ${index + 1} 組`;
}

/**
 * 使用 Fisher-Yates 演算法進行隨機洗牌
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * 將成員清單平均分配給指定數量的隊伍
 */
export function splitIntoGroups<T>(items: T[], groupCount: number): T[][] {
  const groups: T[][] = Array.from({ length: groupCount }, () => []);
  const shuffled = shuffleArray(items);

  shuffled.forEach((item, index) => {
    groups[index % groupCount]!.push(item);
  });

  return groups;
}

/**
 * 解析文字名單（支援以逗號、全形逗號、空格、換行分隔）
 */
export function parseMemberList(rawInput: string): string[] {
  if (!rawInput) return [];

  // 以逗號（,、，）、空白、換行進行分割
  const rawList = rawInput
    .split(/[,，\s\n]+/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  // 保持順序去重
  return Array.from(new Set(rawList));
}

/**
 * 建立分組結果 Embed
 */
export function buildGroupEmbed(
  groups: { name: string; members: string[] }[],
  totalMembers: number,
  displayName: string,
  originalListText?: string
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x3B82F6) // 藍色主調
    .setTitle('🎲 隨機分組結果')
    .setTimestamp();

  groups.forEach(group => {
    const memberListStr = group.members.join('、 ');
    embed.addFields({
      name: `${group.name} (${group.members.length} 人)`,
      value: memberListStr.length > 0 ? memberListStr : '*(無成員)*',
      inline: false,
    });
  });

  let footerText = `共 ${totalMembers} 人 ‧ 分為 ${groups.length} 組 ‧ 由 ${displayName} 發起`;
  if (originalListText) {
    // 若手動輸入名單，於 Description 備註原名單
    embed.setDescription(`**原始名單：** ${originalListText}`);
  }

  embed.setFooter({ text: footerText });

  return embed;
}

/**
 * 建立「🎲 重新分組」按鈕元件
 */
export function getGroupRerollButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('reroll_group')
      .setLabel('🎲 重新分組')
      .setStyle(ButtonStyle.Primary)
  );
}
