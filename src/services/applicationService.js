const applicationsRepo = require('../database/repositories/applications.repo');
const factionService = require('./factionService');
const {
  buildApplicationReviewCard,
  buildApplicationDecidedCard,
  buildApplicationConfirmationCard,
  buildApplicationDecisionDM,
} = require('../utils/applicationCards');
const { postToConfiguredChannel } = require('./configService');
const { dmSafe } = require('./fineService');
const logger = require('../utils/logger');

async function submitApplication(guild, type, applicant, answers, faction = null) {
  const appId = applicationsRepo.create(guild.id, type, applicant.id, answers, faction?.id || null);
  const createdAt = Date.now();
  const avatarUrl = applicant.displayAvatarURL({ size: 128, extension: 'png' });

  const card = buildApplicationReviewCard({
    appId,
    type,
    applicantId: applicant.id,
    avatarUrl,
    answers,
    factionName: faction?.name,
    createdAt,
  });

  let message = null;
  if (type === 'faction' && faction?.review_channel_id) {
    const channel = await guild.channels.fetch(faction.review_channel_id).catch(() => null);
    if (channel) message = await channel.send(card);
  }
  if (!message) {
    message = await postToConfiguredChannel(guild, 'application_log_channel_id', card);
  }

  if (message) applicationsRepo.setMessageId(appId, message.id);

  return {
    appId,
    confirmationCard: buildApplicationConfirmationCard({ appId, type, answers, factionName: faction?.name, avatarUrl }),
  };
}

async function buildDecidedCardForApplication(guild, application, decision, reviewerId, reason) {
  const applicant = await guild.client.users.fetch(application.applicant_discord_id).catch(() => null);
  const faction = application.faction_id ? factionService.getFaction(application.faction_id) : null;

  return buildApplicationDecidedCard({
    appId: application.id,
    type: application.type,
    applicantId: application.applicant_discord_id,
    avatarUrl: applicant?.displayAvatarURL({ size: 128, extension: 'png' }) || null,
    answers: JSON.parse(application.answers),
    factionName: faction?.name,
    createdAt: application.created_at,
    decision,
    reviewerId,
    reason,
  });
}

async function acceptApplication(guild, appId, reviewerId, message) {
  const application = applicationsRepo.getById(appId);
  if (!application || application.status !== 'pending') return { ok: false };

  applicationsRepo.decide(appId, 'accepted', reviewerId);

  let factionName = null;
  if (application.type === 'faction' && application.faction_id) {
    const faction = factionService.getFaction(application.faction_id);
    factionName = faction?.name;
    const lowest = factionService.getLowestRank(application.faction_id);
    if (lowest) {
      await factionService.addMember(guild, application.faction_id, application.applicant_discord_id, lowest.id);
    }
  }

  const applicant = await guild.client.users.fetch(application.applicant_discord_id).catch(() => null);
  if (applicant) {
    await dmSafe(
      applicant,
      buildApplicationDecisionDM({ type: application.type, factionName, decision: 'accepted', reviewerId })
    );
  }

  if (message) {
    const decidedCard = await buildDecidedCardForApplication(guild, application, 'accepted', reviewerId, null);
    await message.edit(decidedCard).catch((err) => logger.warn('Nie udało się zaktualizować karty aplikacji:', err.message));
  }

  return { ok: true, application };
}

async function rejectApplication(guild, appId, reviewerId, reason, message) {
  const application = applicationsRepo.getById(appId);
  if (!application || application.status !== 'pending') return { ok: false };

  applicationsRepo.decide(appId, 'rejected', reviewerId, reason || null);

  const faction = application.faction_id ? factionService.getFaction(application.faction_id) : null;

  const applicant = await guild.client.users.fetch(application.applicant_discord_id).catch(() => null);
  if (applicant) {
    await dmSafe(
      applicant,
      buildApplicationDecisionDM({ type: application.type, factionName: faction?.name, decision: 'rejected', reviewerId, reason })
    );
  }

  if (message) {
    const decidedCard = await buildDecidedCardForApplication(guild, application, 'rejected', reviewerId, reason);
    await message.edit(decidedCard).catch((err) => logger.warn('Nie udało się zaktualizować karty aplikacji:', err.message));
  }

  return { ok: true, application };
}

module.exports = { submitApplication, acceptApplication, rejectApplication };
