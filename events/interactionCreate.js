const { getDate } = require('../utils/functions');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            const { date, time } = getDate();
            console.log(`[${date} ${time}](${interaction.user.tag}) Executing command: /${interaction.commandName}`);
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({
                content: '명령어를 실행하는 중 오류가 발생했습니다!',
                ephemeral: true,
            });
        }
    },
};
