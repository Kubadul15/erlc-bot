const { EmbedBuilder } = require('discord.js');
const { BRAND_NAME, EMBED_COLOR, EMOJI, EMBED_COLOR_DANGER, EMBED_COLOR_SUCCESS } = require('../config/constants');

/** Bazowy embed marki - wszystkie inne buildery ponizej go opakowuja, zeby styl byl spojny. */
function brandEmbed({ title, description, color, fields, thumbnail, footer } = {}) {
  const embed = new EmbedBuilder()
    .setColor(color ?? EMBED_COLOR)
    .setFooter({ text: footer ?? BRAND_NAME })
    .setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields?.length) embed.addFields(fields);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

function errorEmbed(message) {
  return brandEmbed({ description: `${EMOJI.error} ${message}`, color: EMBED_COLOR_DANGER });
}

function successEmbed(message) {
  return brandEmbed({ description: `${EMOJI.success} ${message}`, color: EMBED_COLOR_SUCCESS });
}

module.exports = {
  brandEmbed,
  errorEmbed,
  successEmbed,
};
