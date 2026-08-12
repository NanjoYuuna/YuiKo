import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  Message,
} from 'discord.js';

// ─── 0. Types ─────────────────────────────────────────────────────────────────

export type ChoiceTemplate =
  | 'template_a'
  | 'template_b'
  | 'template_c'
  | 'template_d'
  | 'template_e'
  | 'template_f'
  | 'template_g';

export type RollTemplate = 'template_a' | 'template_b' | 'template_c';

// ─── 1. Slash Command Definitions ─────────────────────────────────────────────

export const choiceDemoData = new SlashCommandBuilder()
  .setName('choice_demo')
  .setDescription('🔀 隨機樣板展示與測試');

export const rollDemoData = new SlashCommandBuilder()
  .setName('roll_demo')
  .setDescription('🎲 擲骰樣板展示與測試');

// ─── 2. UI Builders (Select Menu Rows) ────────────────────────────────────────

function buildChoiceDemoSelectRow(selectedTemplate: ChoiceTemplate): ActionRowBuilder<StringSelectMenuBuilder> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('choice_demo_select')
    .setPlaceholder('選擇隨機抽選版型...')
    .addOptions([
      {
        label: '樣板 A',
        description: '展示樣板 A 排版',
        value: 'template_a',
        default: selectedTemplate === 'template_a',
      },
      {
        label: '樣板 B',
        description: '展示樣板 B 排版',
        value: 'template_b',
        default: selectedTemplate === 'template_b',
      },
      {
        label: '樣板 C',
        description: '展示樣板 C 排版',
        value: 'template_c',
        default: selectedTemplate === 'template_c',
      },
      {
        label: '樣板 D',
        description: '展示樣板 D 排版',
        value: 'template_d',
        default: selectedTemplate === 'template_d',
      },
      {
        label: '樣板 E',
        description: '展示樣板 E 排版',
        value: 'template_e',
        default: selectedTemplate === 'template_e',
      },
      {
        label: '樣板 F',
        description: '展示樣板 F 排版',
        value: 'template_f',
        default: selectedTemplate === 'template_f',
      },
      {
        label: '樣板 G',
        description: '展示樣板 G 排版',
        value: 'template_g',
        default: selectedTemplate === 'template_g',
      },
    ]);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

function buildRollDemoSelectRow(selectedTemplate: RollTemplate): ActionRowBuilder<StringSelectMenuBuilder> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('roll_demo_select')
    .setPlaceholder('選擇擲骰結果版型...')
    .addOptions([
      {
        label: '樣板 A',
        description: '展示樣板 A 排版',
        value: 'template_a',
        default: selectedTemplate === 'template_a',
      },
      {
        label: '樣板 B',
        description: '展示樣板 B 排版',
        value: 'template_b',
        default: selectedTemplate === 'template_b',
      },
      {
        label: '樣板 C',
        description: '展示樣板 C 排版',
        value: 'template_c',
        default: selectedTemplate === 'template_c',
      },
    ]);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

// ─── 3. Embed Generators ──────────────────────────────────────────────────────

export function buildChoiceDemoEmbed(
  template: ChoiceTemplate,
  userName: string
): EmbedBuilder {
  const picked = '壽司';
  const optionsText = '壽司 披薩 漢堡';

  switch (template) {
    case 'template_a':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 A)')
        .setDescription(
          `## 👉 ${picked}\n\n` +
          `**選項**\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();

    case 'template_b':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 B)')
        .setDescription(
          `## 👉 ${picked}\n\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();

    case 'template_c':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 C)')
        .setDescription(
          `## ➔ ${picked}\n\n` +
          `**選項**\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();

    case 'template_d':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 D)')
        .setDescription(
          `## ${picked}\n\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();

    case 'template_e':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 E)')
        .setDescription(
          `## 🤌 ${picked}\n\n` +
          `**選項**\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();

    case 'template_f':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 F)')
        .setDescription(
          `## 🫴🏽 ${picked}\n\n` +
          `**選項**\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();

    case 'template_g':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 G)')
        .setDescription(
          `## ${picked}\n\n` +
          `**選項**\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();
  }
}

export function buildRollDemoEmbed(
  template: RollTemplate,
  userName: string
): EmbedBuilder {
  const expression = '3d20+2';
  const total = 38;
  const breakdown = '[**12**, **18**, **6**] + 2';

  switch (template) {
    case 'template_a':
      return new EmbedBuilder()
        .setColor(0x00A8E8)
        .setTitle('🎲 擲骰結果 (樣板 A)')
        .setDescription(
          `> **\` ${expression} \`**\n` +
          `## 👉 **${total}**`
        )
        .addFields({
          name: '🎲 擲骰過程',
          value: breakdown,
          inline: false,
        })
        .setFooter({ text: `由 ${userName} 擲出` })
        .setTimestamp();

    case 'template_b':
      return new EmbedBuilder()
        .setColor(0x00A8E8)
        .setTitle('🎲 擲骰結果 (樣板 B)')
        .setDescription(
          `> 指令：\`${expression}\`\n` +
          `> 過程：${breakdown}\n` +
          `## ➔ **${total}**`
        )
        .setFooter({ text: `由 ${userName} 擲出` })
        .setTimestamp();

    case 'template_c':
      return new EmbedBuilder()
        .setColor(0x00A8E8)
        .setTitle('🎲 擲骰結果 (樣板 C)')
        .setDescription(
          `> **\` ${expression} \`**\n` +
          `## ➔ **${total}**\n` +
          `${breakdown}`
        )
        .setFooter({ text: `由 ${userName} 擲出` })
        .setTimestamp();
  }
}

// ─── 4. Command Handlers ──────────────────────────────────────────────────────

export async function executeChoiceDemo(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = buildChoiceDemoEmbed('template_a', interaction.user.displayName);
  const row = buildChoiceDemoSelectRow('template_a');
  await interaction.reply({ embeds: [embed], components: [row] });
}

export async function executeRollDemo(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = buildRollDemoEmbed('template_a', interaction.user.displayName);
  const row = buildRollDemoSelectRow('template_a');
  await interaction.reply({ embeds: [embed], components: [row] });
}

export async function executeChoiceDemoText(message: Message): Promise<void> {
  const embed = buildChoiceDemoEmbed('template_a', message.author.displayName);
  const row = buildChoiceDemoSelectRow('template_a');
  await message.reply({ embeds: [embed], components: [row] });
}

export async function executeRollDemoText(message: Message): Promise<void> {
  const embed = buildRollDemoEmbed('template_a', message.author.displayName);
  const row = buildRollDemoSelectRow('template_a');
  await message.reply({ embeds: [embed], components: [row] });
}

// ─── 5. Select Menu Event Handler ─────────────────────────────────────────────

export async function handleTempDemoSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  const displayName = interaction.user.displayName;

  if (interaction.customId === 'choice_demo_select') {
    const selected = interaction.values[0] as ChoiceTemplate;
    const embed = buildChoiceDemoEmbed(selected, displayName);
    const row = buildChoiceDemoSelectRow(selected);
    await interaction.update({ embeds: [embed], components: [row] });
  } else if (interaction.customId === 'roll_demo_select') {
    const selected = interaction.values[0] as RollTemplate;
    const embed = buildRollDemoEmbed(selected, displayName);
    const row = buildRollDemoSelectRow(selected);
    await interaction.update({ embeds: [embed], components: [row] });
  }
}
