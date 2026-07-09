const { TextInputStyle } = require('discord.js');

module.exports = {
  staff: [
    { id: 'Dlaczego chcesz dołączyć do staffu', label: 'Dlaczego chcesz dołączyć do staffu?', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Doświadczenie', label: 'Twoje wcześniejsze doświadczenie', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Wiek', label: 'Wiek', style: TextInputStyle.Short, required: true, maxLength: 3 },
    { id: 'Dostępność', label: 'Dostępność (godziny/dni w tygodniu)', style: TextInputStyle.Short, required: true, maxLength: 100 },
    { id: 'Dodatkowe informacje', label: 'Dodatkowe informacje (opcjonalnie)', style: TextInputStyle.Paragraph, required: false, maxLength: 1000 },
  ],
  faction: [
    { id: 'Dlaczego chcesz dołączyć', label: 'Dlaczego chcesz dołączyć do tej frakcji?', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Doświadczenie RP', label: 'Doświadczenie w RP', style: TextInputStyle.Paragraph, required: true, maxLength: 1000 },
    { id: 'Dostępność', label: 'Dostępność (godziny/dni w tygodniu)', style: TextInputStyle.Short, required: true, maxLength: 100 },
  ],
};
