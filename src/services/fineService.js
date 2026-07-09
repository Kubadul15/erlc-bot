const finesRepo = require('../database/repositories/fines.repo');
const recordsRepo = require('../database/repositories/criminalRecords.repo');
const citizensRepo = require('../database/repositories/citizens.repo');
const { brandEmbed } = require('../utils/embeds');
const { postToConfiguredChannel } = require('./configService');

async function dmSafe(user, payload) {
  try {
    await user.send(payload);
  } catch {
    // uzytkownik moze miec zamkniete DM - ignorujemy
  }
}

async function issueFine(guild, targetUser, amount, reason, staffId) {
  const citizen = citizensRepo.getActive(guild.id, targetUser.id);
  if (!citizen) return null;

  const fineId = finesRepo.issue(guild.id, citizen.id, staffId, amount, reason);

  const embed = brandEmbed({
    title: `💰 Nowy mandat`,
    fields: [
      { name: 'Użytkownik', value: `<@${targetUser.id}>`, inline: true },
      { name: 'Kwota', value: `$${amount}`, inline: true },
      { name: 'Wystawił', value: `<@${staffId}>`, inline: true },
      { name: 'Powód', value: reason },
    ],
  });

  await postToConfiguredChannel(guild, 'mod_log_channel_id', { embeds: [embed] });
  await dmSafe(targetUser, { embeds: [embed] });

  return fineId;
}

async function addRecord(guild, targetUser, offense, details, staffId) {
  const citizen = citizensRepo.getActive(guild.id, targetUser.id);
  if (!citizen) return null;

  const recordId = recordsRepo.add(guild.id, citizen.id, staffId, offense, details || null);

  const fields = [
    { name: 'Użytkownik', value: `<@${targetUser.id}>`, inline: true },
    { name: 'Wystawił', value: `<@${staffId}>`, inline: true },
    { name: 'Wykroczenie', value: offense },
  ];
  if (details) fields.push({ name: 'Szczegóły', value: details });

  const embed = brandEmbed({ title: '⚖️ Nowy wpis w rejestrze karnym', fields });

  await postToConfiguredChannel(guild, 'mod_log_channel_id', { embeds: [embed] });
  await dmSafe(targetUser, { embeds: [embed] });

  return recordId;
}

module.exports = { issueFine, addRecord, dmSafe };
