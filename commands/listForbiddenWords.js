const { SlashCommandBuilder } = require('discord.js');
const { updateRoomData } = require('../utils/room');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('censorlist')
        .setDescription('현재 채널의 검열 단어 목록을 출력합니다.'),
    async execute(interaction) {
        const roomData = updateRoomData(interaction)[interaction.guild.id];

        if (!roomData.forbiddenWords.length) {
            await interaction.reply({ content: '⚠️ 현재 검열 목록에 등록된 단어가 없습니다.', ephemeral: true });
            return;
        }

        const wordList = roomData.forbiddenWords.map((word, index) => `${index + 1}. ${word}`).join('\n');

        await interaction.reply({
            content: `📋 **현재 검열 단어 목록:**\n\`\`\`\n${wordList}\n\`\`\``,
            ephemeral: false
        });
    }
};
