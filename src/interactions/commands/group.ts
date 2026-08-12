import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMember,
  ButtonInteraction,
} from 'discord.js';
import {
  parseMemberList,
  splitIntoGroups,
  getTeamName,
  buildGroupEmbed,
  getGroupRerollButton,
} from '../../utils/grouping.js';

// ─── 1. Slash Command Definitions ─────────────────────────────────────────────

export const groupVoiceData = new SlashCommandBuilder()
  .setName('group_voice')
  .setDescription('🔊 語音分組：自動抓取當前語音頻道成員並進行分組')
  .addIntegerOption(opt =>
    opt
      .setName('count')
      .setDescription('要分成的隊伍數量')
      .setRequired(true)
  );

export const groupListData = new SlashCommandBuilder()
  .setName('group_list')
  .setDescription('👥 分組：將手動輸入的名單隨機分配至指定隊伍數')
  .addStringOption(opt =>
    opt
      .setName('members')
      .setDescription('成員名單（用逗號、空格或換行分隔）')
      .setRequired(true)
  )
  .addIntegerOption(opt =>
    opt
      .setName('count')
      .setDescription('要分成的隊伍數量')
      .setRequired(true)
  );

// ─── 2. Command Handlers ──────────────────────────────────────────────────────

/**
 * 處理 /group_voice (語音分組)
 */
export async function executeGroupVoice(interaction: ChatInputCommandInteraction): Promise<void> {
  const count = interaction.options.getInteger('count', true);
  const member = interaction.member as GuildMember;

  // 防呆：發起人是否在語音頻道
  const voiceChannel = member?.voice?.channel;
  if (!voiceChannel) {
    await interaction.reply({
      content: '⚠️ 請先加入語音頻道後再使用此指令！',
      ephemeral: true,
    });
    return;
  }

  // 抓取非 Bot 成員的名單
  const members = voiceChannel.members
    .filter(m => !m.user.bot)
    .map(m => m.displayName);

  // 防呆：人數 < 2 人
  if (members.length < 2) {
    await interaction.reply({
      content: `⚠️ 語音頻道（${voiceChannel.name}）內非 Bot 人數不足 2 人，無法進行分組！`,
      ephemeral: true,
    });
    return;
  }

  // 防呆：隊伍數量非法或大於總人數
  if (count <= 0) {
    await interaction.reply({
      content: '⚠️ 隊伍數量必須大於 0！',
      ephemeral: true,
    });
    return;
  }

  if (count > members.length) {
    await interaction.reply({
      content: `⚠️ 隊伍數量 (${count}) 不能大於總人數 (${members.length})！`,
      ephemeral: true,
    });
    return;
  }

  // 執行隨機分組
  const splitted = splitIntoGroups(members, count);
  const groups = splitted.map((groupMembers, i) => ({
    name: getTeamName(i),
    members: groupMembers,
  }));

  const embed = buildGroupEmbed(groups, members.length, interaction.user.displayName);
  const buttonRow = getGroupRerollButton();

  await interaction.reply({
    embeds: [embed],
    components: [buttonRow],
  });
}

/**
 * 處理 /group_list (手動名單分組)
 */
export async function executeGroupList(interaction: ChatInputCommandInteraction): Promise<void> {
  const membersRaw = interaction.options.getString('members', true);
  const count = interaction.options.getInteger('count', true);

  const members = parseMemberList(membersRaw);

  // 防呆：人數 < 2 人
  if (members.length < 2) {
    await interaction.reply({
      content: '⚠️ 輸入的名單有效人數不足 2 人，無法進行分組！',
      ephemeral: true,
    });
    return;
  }

  // 防呆：隊伍數量非法或大於總人數
  if (count <= 0) {
    await interaction.reply({
      content: '⚠️ 隊伍數量必須大於 0！',
      ephemeral: true,
    });
    return;
  }

  if (count > members.length) {
    await interaction.reply({
      content: `⚠️ 隊伍數量 (${count}) 不能大於總人數 (${members.length})！`,
      ephemeral: true,
    });
    return;
  }

  // 執行隨機分組
  const splitted = splitIntoGroups(members, count);
  const groups = splitted.map((groupMembers, i) => ({
    name: getTeamName(i),
    members: groupMembers,
  }));

  const originalListText = members.join('、 ');
  const embed = buildGroupEmbed(groups, members.length, interaction.user.displayName, originalListText);
  const buttonRow = getGroupRerollButton();

  await interaction.reply({
    embeds: [embed],
    components: [buttonRow],
  });
}

// ─── 3. Button Interaction Handler ────────────────────────────────────────────

/**
 * 處理 🎲 重新分組 (reroll_group) 按鈕觸發
 */
export async function handleGroupRerollButton(interaction: ButtonInteraction): Promise<void> {
  const messageEmbed = interaction.message.embeds[0];
  if (!messageEmbed) {
    await interaction.reply({ content: '⚠️ 無法提取原分組資訊！', ephemeral: true });
    return;
  }

  let members: string[] = [];
  let teamCount = messageEmbed.fields.length;
  let originalListText: string | undefined = undefined;

  // 1. 如果 Embed 的 description 包含原始名單（來自 /group_list）
  if (messageEmbed.description && messageEmbed.description.includes('**原始名單：**')) {
    const rawListText = messageEmbed.description.replace('**原始名單：**', '').trim();
    originalListText = rawListText;
    members = parseMemberList(rawListText);
  } else {
    // 2. 否則從 Embed 的各個 Fields 提取現有成員
    messageEmbed.fields.forEach(field => {
      if (field.value && field.value !== '*(無成員)*') {
        const fieldMembers = field.value.split('、 ').map(m => m.trim()).filter(m => m.length > 0);
        members.push(...fieldMembers);
      }
    });
  }

  if (members.length < 2 || teamCount <= 0) {
    await interaction.reply({ content: '⚠️ 重新分組失敗：資訊有誤！', ephemeral: true });
    return;
  }

  // 重新進行 Fisher-Yates 洗牌與分組
  const splitted = splitIntoGroups(members, teamCount);
  const groups = splitted.map((groupMembers, i) => ({
    name: getTeamName(i),
    members: groupMembers,
  }));

  const newEmbed = buildGroupEmbed(groups, members.length, interaction.user.displayName, originalListText);
  const buttonRow = getGroupRerollButton();

  await interaction.update({
    embeds: [newEmbed],
    components: [buttonRow],
  });
}

// ─── 4. Plain Text Message Execution Helpers ─────────────────────────────────

/**
 * 處理純文字「分組 名單 隊伍數」
 */
export async function executeGroupListText(
  message: import('discord.js').Message,
  membersRaw: string,
  count: number
): Promise<void> {
  const members = parseMemberList(membersRaw);

  if (members.length < 2) {
    await message.reply('⚠️ 輸入的名單有效人數不足 2 人，無法進行分組！');
    return;
  }

  if (count <= 0) {
    await message.reply('⚠️ 隊伍數量必須大於 0！');
    return;
  }

  if (count > members.length) {
    await message.reply(`⚠️ 隊伍數量 (${count}) 不能大於總人數 (${members.length})！`);
    return;
  }

  const splitted = splitIntoGroups(members, count);
  const groups = splitted.map((groupMembers, i) => ({
    name: getTeamName(i),
    members: groupMembers,
  }));

  const originalListText = members.join('、 ');
  const embed = buildGroupEmbed(groups, members.length, message.author.displayName, originalListText);
  const buttonRow = getGroupRerollButton();

  await message.reply({
    embeds: [embed],
    components: [buttonRow],
  });
}

/**
 * 處理純文字「語音分組 隊伍數」
 */
export async function executeGroupVoiceText(
  message: import('discord.js').Message,
  count: number
): Promise<void> {
  const member = message.member;
  const voiceChannel = member?.voice?.channel;

  if (!voiceChannel) {
    await message.reply('⚠️ 請先加入語音頻道後再使用此指令！');
    return;
  }

  const members = voiceChannel.members
    .filter(m => !m.user.bot)
    .map(m => m.displayName);

  if (members.length < 2) {
    await message.reply(`⚠️ 語音頻道（${voiceChannel.name}）內非 Bot 人數不足 2 人，無法進行分組！`);
    return;
  }

  if (count <= 0) {
    await message.reply('⚠️ 隊伍數量必須大於 0！');
    return;
  }

  if (count > members.length) {
    await message.reply(`⚠️ 隊伍數量 (${count}) 不能大於總人數 (${members.length})！`);
    return;
  }

  const splitted = splitIntoGroups(members, count);
  const groups = splitted.map((groupMembers, i) => ({
    name: getTeamName(i),
    members: groupMembers,
  }));

  const embed = buildGroupEmbed(groups, members.length, message.author.displayName);
  const buttonRow = getGroupRerollButton();

  await message.reply({
    embeds: [embed],
    components: [buttonRow],
  });
}
