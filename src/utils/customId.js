const SEPARATOR = ':';

function build(...parts) {
  return parts.map(String).join(SEPARATOR);
}

function parse(customId) {
  return customId.split(SEPARATOR);
}

/** Zwraca true jesli customId zaczyna sie od podanego prefiksu segmentow. */
function startsWith(customId, ...prefixParts) {
  const parts = parse(customId);
  return prefixParts.every((p, i) => parts[i] === String(p));
}

module.exports = { build, parse, startsWith, SEPARATOR };
