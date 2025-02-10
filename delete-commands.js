const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`${process.env.GUILD_ID} 서버의 모든 / 명령어를 삭제합니다.`);
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: [] }
        );
        console.log(`${process.env.GUILD_ID} 서버의 / 명령어가 성공적으로 삭제되었습니다.`);
    } catch (error) {
        console.error('명령어 삭제 중 오류가 발생했습니다:', error);
    }
})();
