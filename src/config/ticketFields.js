const { TextInputStyle } = require('discord.js');

/**
 * Definicje pol modala dla kazdej kategorii ticketu (max 5 pol / modal - limit Discorda).
 * id -> uzywane jako customId TextInput oraz jako nazwa pola w initial_data / embedzie.
 */
module.exports = {
  general: [
    { id: 'Opis problemu', label: 'Krótki opis problemu', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
  ],
  report: [
    { id: 'Zgłaszany użytkownik', label: 'Zgłaszany użytkownik (nick/ID)', style: TextInputStyle.Short, required: true, maxLength: 100 },
    { id: 'Powód zgłoszenia', label: 'Powód zgłoszenia', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Dowody', label: 'Dowody (link, opcjonalnie)', style: TextInputStyle.Short, required: false, maxLength: 300 },
  ],
  appeal: [
    { id: 'Typ kary', label: 'Typ kary (ban / mute)', style: TextInputStyle.Short, required: true, maxLength: 30 },
    { id: 'Powód kary', label: 'Powód kary wg staffu', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Uzasadnienie odwołania', label: 'Dlaczego kara powinna zostać cofnięta', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
  ],
  bug: [
    { id: 'Opis błędu', label: 'Opis błędu', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Kroki reprodukcji', label: 'Kroki reprodukcji', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Oczekiwane zachowanie', label: 'Oczekiwane zachowanie', style: TextInputStyle.Short, required: false, maxLength: 200 },
  ],
  management: [
    { id: 'Temat', label: 'Temat', style: TextInputStyle.Short, required: true, maxLength: 100 },
    { id: 'Wiadomość', label: 'Wiadomość', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
  ],
  shop: [
    { id: 'Produkt/usługa', label: 'Produkt / usługa', style: TextInputStyle.Short, required: true, maxLength: 100 },
    { id: 'Pytanie', label: 'Pytanie', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
  ],
};
