const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');
const { BRAND_NAME, DIVIDER } = require('../config/constants');

/** Wspolne budulce dla wszystkich "kart" (Discord Components V2) w bocie - spojny, "premium" wyglad zamiast golych embedow. */

function divider() {
  return new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
}

function textDisplay(content) {
  return new TextDisplayBuilder().setContent(content);
}

function footerText(extra) {
  return textDisplay(`-# ${BRAND_NAME}${extra ? ` • ${extra}` : ''}`);
}

/**
 * Sekcja naglowkowa: 1-3 bloki tekstu + miniaturka (avatar/zdjecie) po prawej.
 * Discord wymaga akcesorium (miniatury lub przycisku) dla kazdej Section - jesli
 * nie masz prawdziwego URL-a, przekaz DEFAULT_AVATAR_URL z config/constants.
 */
function headerSection(texts, thumbnailUrl, thumbnailDescription = 'Miniatura') {
  if (!thumbnailUrl) {
    throw new Error('headerSection wymaga thumbnailUrl (Section zawsze potrzebuje akcesorium) - uzyj DEFAULT_AVATAR_URL jako fallback.');
  }
  const section = new SectionBuilder();
  for (const t of texts) section.addTextDisplayComponents(textDisplay(t));
  section.setThumbnailAccessory(new ThumbnailBuilder().setURL(thumbnailUrl).setDescription(thumbnailDescription));
  return section;
}

function mediaGallery(url, description) {
  return new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(url).setDescription(description || 'Zdjęcie'));
}

function baseContainer(accentColor) {
  return new ContainerBuilder().setAccentColor(accentColor);
}

function cardPayload(containers) {
  return { flags: MessageFlags.IsComponentsV2, components: Array.isArray(containers) ? containers : [containers] };
}

module.exports = { divider, textDisplay, footerText, headerSection, mediaGallery, baseContainer, cardPayload, DIVIDER };
