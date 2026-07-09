const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');
const { build } = require('./customId');
const {
  BRAND_NAME,
  EMBED_COLOR,
  EMBED_COLOR_SUCCESS,
  EMBED_COLOR_DANGER,
  DIVIDER,
  APPLICATION_TYPE_LABELS,
} = require('../config/constants');

function divider() {
  return new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
}

function headerText(type, factionName) {
  return type === 'faction' ? `Frakcja — ${factionName}` : APPLICATION_TYPE_LABELS.staff;
}

function formatAnswerBlock(question, answer) {
  const quoted = String(answer)
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  return new TextDisplayBuilder().setContent(`**${question}**\n${quoted}`);
}

/** Karta wysylana na kanal recenzji (staff) - z przyciskami Akceptuj/Odrzuc. */
function buildApplicationReviewCard({ appId, type, applicantId, avatarUrl, answers, factionName, createdAt }) {
  const unixSeconds = Math.floor(createdAt / 1000);

  const container = new ContainerBuilder()
    .setAccentColor(EMBED_COLOR)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## 📋 Nowa Aplikacja — ${headerText(type, factionName)}`),
          new TextDisplayBuilder().setContent(
            `👤 **Aplikujący:** <@${applicantId}>\n` + `🔖 **Numer:** #${appId}\n` + `🕒 **Złożona:** <t:${unixSeconds}:R>`
          )
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl).setDescription('Avatar aplikującego'))
    )
    .addSeparatorComponents(divider());

  for (const [question, answer] of Object.entries(answers)) {
    container.addTextDisplayComponents(formatAnswerBlock(question, answer));
  }

  container
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${BRAND_NAME} • 🟡 Oczekuje na decyzję`))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(build('app', 'accept', appId)).setLabel('Akceptuj').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId(build('app', 'reject', appId)).setLabel('Odrzuć').setStyle(ButtonStyle.Danger).setEmoji('❌')
      )
    );

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

/** Ta sama karta po podjeciu decyzji - bez przyciskow, z blokiem decyzji i kolorem wg wyniku. */
function buildApplicationDecidedCard({ appId, type, applicantId, avatarUrl, answers, factionName, createdAt, decision, reviewerId, reason }) {
  const unixSeconds = Math.floor(createdAt / 1000);
  const accepted = decision === 'accepted';

  const container = new ContainerBuilder()
    .setAccentColor(accepted ? EMBED_COLOR_SUCCESS : EMBED_COLOR_DANGER)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## 📋 Aplikacja — ${headerText(type, factionName)}`),
          new TextDisplayBuilder().setContent(
            `👤 **Aplikujący:** <@${applicantId}>\n` + `🔖 **Numer:** #${appId}\n` + `🕒 **Złożona:** <t:${unixSeconds}:R>`
          )
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl).setDescription('Avatar aplikującego'))
    )
    .addSeparatorComponents(divider());

  for (const [question, answer] of Object.entries(answers)) {
    container.addTextDisplayComponents(formatAnswerBlock(question, answer));
  }

  const decisionLine = accepted
    ? `✅ **Zaakceptowana** przez <@${reviewerId}>`
    : `❌ **Odrzucona** przez <@${reviewerId}>${reason ? `\n**Powód:** ${reason}` : ''}`;

  container
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(decisionLine))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${BRAND_NAME}`));

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

/** Ephemeryczne potwierdzenie dla aplikujacego zaraz po wyslaniu formularza. */
function buildApplicationConfirmationCard({ appId, type, answers, factionName, avatarUrl }) {
  const container = new ContainerBuilder()
    .setAccentColor(EMBED_COLOR)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ✅ Aplikacja wysłana`),
          new TextDisplayBuilder().setContent(
            `Twoja aplikacja (**${headerText(type, factionName)}**) — numer **#${appId}** — czeka na rozpatrzenie przez staff.\n` +
              `Otrzymasz wiadomość prywatną z decyzją.`
          )
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl).setDescription('Twój avatar'))
    )
    .addSeparatorComponents(divider());

  for (const [question, answer] of Object.entries(answers)) {
    container.addTextDisplayComponents(formatAnswerBlock(question, answer));
  }

  container.addSeparatorComponents(divider()).addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${BRAND_NAME}`));

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

/** Karta DM wysylana aplikujacemu po decyzji staffu. */
function buildApplicationDecisionDM({ type, factionName, decision, reviewerId, reason }) {
  const accepted = decision === 'accepted';

  const nextSteps = accepted
    ? type === 'faction'
      ? `Zostałeś dodany do frakcji **${factionName}** i otrzymałeś odpowiednie role. Sprawdź kanały frakcji, aby poznać dalsze kroki.`
      : `Zespół skontaktuje się z Tobą wkrótce w sprawie dalszych kroków rekrutacji.`
    : `Możesz aplikować ponownie w przyszłości. W razie pytań skontaktuj się ze staffem przez ticket.`;

  const container = new ContainerBuilder()
    .setAccentColor(accepted ? EMBED_COLOR_SUCCESS : EMBED_COLOR_DANGER)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        accepted ? `## ✅ Aplikacja zaakceptowana!` : `## ❌ Aplikacja odrzucona`
      ),
      new TextDisplayBuilder().setContent(`**Rodzaj:** ${headerText(type, factionName)}\n**Rozpatrzona przez:** <@${reviewerId}>`)
    )
    .addSeparatorComponents(divider());

  if (!accepted && reason) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Powód:**\n> ${reason}`));
  }

  container
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(nextSteps))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${BRAND_NAME}`));

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

module.exports = {
  buildApplicationReviewCard,
  buildApplicationDecidedCard,
  buildApplicationConfirmationCard,
  buildApplicationDecisionDM,
};
