const { MessageFlags } = require('discord.js');
const { startsWith, parse } = require('../../utils/customId');
const verificationService = require('../../services/verificationService');
const { errorEmbed } = require('../../utils/embeds');

module.exports = {
  match: (customId) => startsWith(customId, 'verify', 'submit'),
  async execute(interaction) {
    const expectedCode = parse(interaction.customId)[2];
    const enteredCode = interaction.fields.getTextInputValue('captcha_code');
    const nickname = interaction.fields.getTextInputValue('nickname');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await verificationService.completeVerification(interaction.guild, interaction.user.id, expectedCode, enteredCode, nickname);

    if (!result.ok) {
      await interaction.editReply({
        embeds: [errorEmbed('Niepoprawny kod weryfikacyjny. Spróbuj ponownie.')],
        components: [verificationService.retryButtonRow()],
      });
      return;
    }

    if (!result.nicknameSet) {
      await interaction.followUp({
        embeds: [errorEmbed('Zweryfikowano, ale nie udało się ustawić Twojego nicku (za wysokie uprawnienia lub brak uprawnień bota). Poproś staff o zmianę nicku ręcznie.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.editReply(result.card);
  },
};
