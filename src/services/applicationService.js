const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const applicationsRepo = require('../database/repositories/applications.repo');
const factionService = require('./factionService');
const { applicationReviewEmbed, brandEmbed, successEmbed } = require('../utils/embeds');
const { postToConfiguredChannel } = require('./configService');
const { build } = require('../utils/customId');
const { dmSafe } = require('./fineService');
const logger = require('../utils/logger');

async function submitApplication(guild, type, applicant, answers, faction = null) {
  const appId = applicationsRepo.create(guild.id, type, applicant.id, answers, faction?.id || null);

  const embed = applicationReviewEmbed({
    type,
    applicantId: applicant.id,
    answers,
    factionName: faction?.name,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(build('app', 'accept', appId)).setLabel('Akceptuj').setStyle(ButtonStyle.Success).setEmoji('✅'),
    new ButtonBuilder().setCustomId(build('app', 'reject', appId)).setLabel('Odrzuć').setStyle(ButtonStyle.Danger).setEmoji('❌')
  );

  let message = null;
  if (type === 'faction' && faction?.review_channel_id) {
    const channel = await guild.channels.fetch(faction.review_channel_id).catch(() => null);
    if (channel) message = await channel.send({ embeds: [embed], components: [row] });
  }
  if (!message) {
    message = await postToConfiguredChannel(guild, 'application_log_channel_id', { embeds: [embed], components: [row] });
  }

  if (message) applicationsRepo.setMessageId(appId, message.id);
  return appId;
}

async function acceptApplication(guild, appId, reviewerId, message) {
  const application = applicationsRepo.getById(appId);
  if (!application || application.status !== 'pending') return { ok: false };

  applicationsRepo.decide(appId, 'accepted', reviewerId);

  if (application.type === 'faction' && application.faction_id) {
    const lowest = factionService.getLowestRank(application.faction_id);
    if (lowest) {
      await factionService.addMember(guild, application.faction_id, application.applicant_discord_id, lowest.id);
    }
  }

  const applicant = await guild.client.users.fetch(application.applicant_discord_id).catch(() => null);
  if (applicant) {
    await dmSafe(applicant, {
      embeds: [successEmbed(`Twoja aplikacja (${application.type === 'faction' ? 'frakcja' : 'staff'}) została zaakceptowana! 🎉`)],
    });
  }

  if (message) {
    const disabledRow = ActionRowBuilder.from(message.components[0]);
    disabledRow.components = disabledRow.components.map((c) => ButtonBuilder.from(c).setDisabled(true));
    await message.edit({ components: [disabledRow] }).catch((err) => logger.warn('Nie udało się zablokować przycisków aplikacji:', err.message));
  }

  return { ok: true, application };
}

async function rejectApplication(guild, appId, reviewerId, reason, message) {
  const application = applicationsRepo.getById(appId);
  if (!application || application.status !== 'pending') return { ok: false };

  applicationsRepo.decide(appId, 'rejected', reviewerId, reason || null);

  const applicant = await guild.client.users.fetch(application.applicant_discord_id).catch(() => null);
  if (applicant) {
    await dmSafe(applicant, {
      embeds: [
        brandEmbed({
          description: `❌ Twoja aplikacja (${application.type === 'faction' ? 'frakcja' : 'staff'}) została odrzucona.${
            reason ? `\n**Powód:** ${reason}` : ''
          }`,
        }),
      ],
    });
  }

  if (message) {
    const disabledRow = ActionRowBuilder.from(message.components[0]);
    disabledRow.components = disabledRow.components.map((c) => ButtonBuilder.from(c).setDisabled(true));
    await message.edit({ components: [disabledRow] }).catch((err) => logger.warn('Nie udało się zablokować przycisków aplikacji:', err.message));
  }

  return { ok: true, application };
}

module.exports = { submitApplication, acceptApplication, rejectApplication };
