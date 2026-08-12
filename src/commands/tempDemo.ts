import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  Message,
} from 'discord.js';

// ─── 1. Slash Command Definitions ─────────────────────────────────────────────

export const choiceDemoData = new SlashCommandBuilder()
  .setName('choice_demo')
  .setDescription('🔀 隨機樣板展示與測試');

export const rollDemoData = new SlashCommandBuilder()
  .setName('roll_demo')
  .setDescription('🎲 擲骰樣板展示與測試');

// ─── 2. UI Builders (Select Menu Rows) ────────────────────────────────────────

function buildChoiceDemoSelectRow(selectedTemplate: 'template_a' | 'template_b' | 'template_c'): ActionRowBuilder<StringSelectMenuBuilder> {
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
    ]);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

function buildRollDemoSelectRow(selectedTemplate: 'template_a' | 'template_b' | 'template_c'): ActionRowBuilder<StringSelectMenuBuilder> {
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
  template: 'template_a' | 'template_b' | 'template_c',
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
          `**選項**\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();

    case 'template_c':
      return new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('🔀 隨機抽選 (樣板 C)')
        .setDescription(
          `## 👉 ${picked}\n\n` +
          `**選項**\n` +
          `\`\`\`\n${optionsText}\n\`\`\``
        )
        .setFooter({ text: `3 個選項 由 ${userName} 發起` })
        .setTimestamp();
  }
}

export function buildRollDemoEmbed(
  template: 'template_a' | 'template_b' | 'template_c',
  userName: string
): EmbedBuilder {
  const expression = '1d100';
  const total = 87;
  const breakdown = '**87**';

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

    case 'template_c':
      return new EmbedBuilder()
        .setColor(0x00A8E8)
        .setTitle('🎲 擲骰結果 (樣板 C)')
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
  const selected = interaction.values[0] as 'template_a' | 'template_b' | 'template_c';
  const displayName = interaction.user.displayName;

  if (interaction.customId === 'choice_demo_select') {
    const embed = buildChoiceDemoEmbed(selected, displayName);
    const row = buildChoiceDemoSelectRow(selected);
    await interaction.update({ embeds: [embed], components: [row] });
  } else if (interaction.customId === 'roll_demo_select') {
    const embed = buildRollDemoEmbed(selected, displayName);
    const row = buildRollDemoSelectRow(selected);
    await interaction.update({ embeds: [embed], components: [row] });
  }
}
