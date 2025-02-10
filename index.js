const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ] 
});

// 이벤트 로드
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// 명령어 로드
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// 스케줄 작업 로드
const tasksPath = path.join(__dirname, 'tasks');
const taskFiles = fs
    .readdirSync(tasksPath)
    .filter(file => file.endsWith('.js'));

client.scheduledTasks = [];

for (const file of taskFiles) {
    const task = require(`./tasks/${file}`);
    if (task.interval && task.execute) {
        const intervalId = setInterval(() => task.execute(client), task.interval);
        client.scheduledTasks.push({ name: task.name, intervalId });
        console.log(`✅ Task Registered: ${task.name} (Interval: ${task.interval / 1000}s)`);
    }
}

client.login(process.env.DISCORD_TOKEN);
