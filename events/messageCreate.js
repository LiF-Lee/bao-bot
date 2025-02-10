const { updateRoomData } = require('../utils/room');
const { isFiltered } = require('../utils/filter');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const roomData = updateRoomData(message)[message.guild.id];
        const forbiddenWords = roomData.forbiddenWords;

        if (isFiltered(message.content, forbiddenWords)) {
            await message.delete().catch(console.error);
            await message.channel.send(`${message.author}, 해당 메시지는 금지어와 유사하여 검열되었습니다.`)
                .then(msg => setTimeout(() => msg.delete(), 5000))
                .catch(console.error);
        }
    },
};
