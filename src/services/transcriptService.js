const { AttachmentBuilder } = require('discord.js');
const ticketMessagesRepo = require('../database/repositories/ticketMessages.repo');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchAllMessages(channel) {
  const all = [];
  let lastId;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;
    all.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }
  return all.reverse(); // chronologicznie
}

function buildHtml(channel, messages) {
  const rows = messages
    .map((m) => {
      const time = new Date(m.createdTimestamp).toLocaleString('pl-PL');
      const attachments = [...m.attachments.values()]
        .map((a) => `<div class="att"><a href="${escapeHtml(a.url)}">${escapeHtml(a.name)}</a></div>`)
        .join('');
      return `<div class="msg">
        <span class="author">${escapeHtml(m.author.tag)}</span>
        <span class="time">${time}</span>
        <div class="content">${escapeHtml(m.content || '')}</div>
        ${attachments}
      </div>`;
    })
    .join('\n');

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Transkrypt — ${escapeHtml(channel.name)}</title>
<style>
  body { background:#313338; color:#dbdee1; font-family: sans-serif; padding: 16px; }
  .msg { margin-bottom: 10px; padding: 8px; border-radius: 6px; background:#2b2d31; }
  .author { font-weight: bold; color:#fff; margin-right: 8px; }
  .time { font-size: 12px; color:#949ba4; }
  .content { white-space: pre-wrap; margin-top: 4px; }
  .att a { color:#00a8fc; }
</style></head>
<body>
  <h2>Transkrypt kanału #${escapeHtml(channel.name)}</h2>
  ${rows}
</body></html>`;
}

function buildText(channel, messages) {
  return messages
    .map((m) => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content || ''}`)
    .join('\n');
}

async function generateAndStore(ticketId, channel) {
  const messages = await fetchAllMessages(channel);

  ticketMessagesRepo.insertMany(
    ticketId,
    messages.map((m) => ({
      discordId: m.author.id,
      authorTag: m.author.tag,
      content: m.content,
      attachments: [...m.attachments.values()].map((a) => a.url),
      createdAt: m.createdTimestamp,
    }))
  );

  const html = buildHtml(channel, messages);
  const text = buildText(channel, messages);

  const attachments = [
    new AttachmentBuilder(Buffer.from(html, 'utf8'), { name: `transkrypt-${ticketId}.html` }),
    new AttachmentBuilder(Buffer.from(text, 'utf8'), { name: `transkrypt-${ticketId}.txt` }),
  ];

  return { attachments, messageCount: messages.length };
}

module.exports = { generateAndStore };
