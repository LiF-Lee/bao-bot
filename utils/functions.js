const { ActivityType } = require('discord.js');
require('dotenv').config();

// 상태 설정
const setPresence = (client, name) => {
    client.user.setPresence({
        activities: [{ name, type: ActivityType.Watching }],
        status: 'online',
    });
}

const getDate = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const date = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    return { date, time };
}

module.exports = {
    setPresence,
    getDate
};
