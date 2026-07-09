const logger = require('../utils/logger');

const USERS_BASE = 'https://users.roblox.com/v1';
const THUMBNAILS_BASE = 'https://thumbnails.roblox.com/v1';

/** Zwraca { id, name, displayName } albo null, jesli nazwa uzytkownika nie istnieje / API zawiodlo. */
async function resolveUsername(username) {
  try {
    const res = await fetch(`${USERS_BASE}/usernames/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.data?.[0];
    if (!user) return null;
    return { id: user.id, name: user.name, displayName: user.displayName };
  } catch (err) {
    logger.warn('Blad zapytania do Roblox (resolveUsername):', err.message);
    return null;
  }
}

/** Zwraca pelny obiekt uzytkownika (m.in. description) albo null. */
async function getUserDetails(userId) {
  try {
    const res = await fetch(`${USERS_BASE}/users/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    logger.warn('Blad zapytania do Roblox (getUserDetails):', err.message);
    return null;
  }
}

/** Zwraca URL miniatury avatara (headshot) albo null. */
async function getAvatarThumbnailUrl(userId) {
  try {
    const res = await fetch(
      `${THUMBNAILS_BASE}/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0]?.imageUrl || null;
  } catch (err) {
    logger.warn('Blad zapytania do Roblox (getAvatarThumbnailUrl):', err.message);
    return null;
  }
}

module.exports = { resolveUsername, getUserDetails, getAvatarThumbnailUrl };
