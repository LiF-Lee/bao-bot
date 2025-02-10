const { SlashCommandBuilder } = require('discord.js');
const { updateRoomData } = require('../utils/room');

const actionChoices = [
    { name: '등록', value: 'add' },
    { name: '삭제', value: 'remove' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('censor')
        .setDescription('현재 채널에서 금지어를 추가하거나 삭제합니다.')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('금지어 등록 또는 삭제')
                .setRequired(true)
                .addChoices(...actionChoices)
        )
        .addStringOption(option =>
            option
                .setName('word')
                .setDescription('관리할 금지어')
                .setRequired(true)
        ),
    async execute(interaction) {
        const actionValue = interaction.options.getString('type');
        const word = interaction.options.getString('word').trim();
        const guildId = interaction.guild.id;
        const roomData = updateRoomData(interaction)[guildId];

        const selectedAction = actionChoices.find(choice => choice.value === actionValue);
        const actionName = selectedAction ? selectedAction.name : '알 수 없음';

        try {
            const isAdding = actionValue === 'add';
            const wordExists = roomData.forbiddenWords.includes(word);

            if ((isAdding && wordExists) || (!isAdding && !wordExists)) {
                return await interaction.reply({
                    content: `❌ '${word}' 단어는 ${isAdding ? '이미 등록되어 있습니다' : '검열 목록에 없습니다'}.`,
                    ephemeral: true
                });
            }

            roomData.forbiddenWords = isAdding
                ? [...roomData.forbiddenWords, word]
                : roomData.forbiddenWords.filter(w => w !== word);

            updateRoomData(interaction, roomData);

            await interaction.reply({
                content: `✅ '${word}' 단어가 검열 목록에 ${actionName}되었습니다.`
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `⚠️ 오류 발생: ${error.message}`, ephemeral: true });
        }
    }
};
