const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dataDirPath = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDirPath, 'room.json');

const updateRoomData = (message, newData = null) => {
    if (!fs.existsSync(dataDirPath)) {
        fs.mkdirSync(dataDirPath, { recursive: true });
    }
    
    let data = {};
    if (fs.existsSync(dataFilePath)) {
        data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }

    if (!data[message.guild.id]) {
        data[message.guild.id] = {
            name: message.guild.name,
            forbiddenWords: []
        };
    }

    data[message.guild.id].name = message.guild.name;

    if (newData) {
        data[message.guild.id] = { ...data[message.guild.id], ...newData };
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4), 'utf8');

    return data;
}

module.exports = {
    updateRoomData
};
