const { PermissionsBitField } = require('discord.js');
const guildSettings = require('../database/repositories/guildSettings.repo');

function hasNativeAdmin(member) {
  return (
    member.permissions.has(PermissionsBitField.Flags.Administrator) ||
    member.permissions.has(PermissionsBitField.Flags.ManageGuild)
  );
}

function memberHasConfiguredRole(member, guildId, key) {
  const roleId = guildSettings.get(guildId, key);
  if (!roleId) return false;
  return member.roles.cache.has(roleId);
}

/** Admin bota: rola role_admin skonfigurowana w /config, albo bootstrap przez natywne uprawnienia Discorda. */
function isAdmin(member) {
  if (hasNativeAdmin(member)) return true;
  return memberHasConfiguredRole(member, member.guild.id, 'role_admin');
}

/** Staff: rola role_staff lub role_admin, albo bootstrap admin natywny. */
function isStaff(member) {
  if (isAdmin(member)) return true;
  return memberHasConfiguredRole(member, member.guild.id, 'role_staff');
}

/** Staff odpowiedzialny za rozpatrywanie aplikacji. */
function isApplicationStaff(member) {
  if (isStaff(member)) return true;
  return memberHasConfiguredRole(member, member.guild.id, 'role_application_staff');
}

/** Uprawniony do zarzadzania dana frakcja (awanse/degradacje/wyrzucenia). */
function canManageFaction(member, faction) {
  if (isAdmin(member)) return true;
  if (faction?.management_role_id && member.roles.cache.has(faction.management_role_id)) {
    return true;
  }
  return false;
}

function hasRole(member, key) {
  return memberHasConfiguredRole(member, member.guild.id, key);
}

module.exports = { isAdmin, isStaff, isApplicationStaff, canManageFaction, hasRole };
