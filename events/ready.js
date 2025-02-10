const { setPresence } = require('../utils/functions');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        setPresence(client, '상태');
        console.log(`Logged in as ${client.user.tag}!`);
    },
};
