const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dataDirPath = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDirPath, 'subscription.json');

const getSubscription = (subscriptionId = null) => {
    if (!fs.existsSync(dataDirPath)) {
        fs.mkdirSync(dataDirPath, { recursive: true });
    }

    let data = {};
    if (fs.existsSync(dataFilePath)) {
        data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }

    if (subscriptionId && !data[subscriptionId]) {
        data[subscriptionId] = [];
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4), 'utf8');

    return subscriptionId ? data[subscriptionId] : data;
}

const addSubscription = (subscriptionId, channelId) => {
    let data = getSubscription();

    if (!data[subscriptionId]) {
        data[subscriptionId] = [];
    }

    if (data[subscriptionId].includes(channelId)) {
        return false;
    }
    
    data[subscriptionId].push(channelId);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4), 'utf8');

    return true;
}

const removeSubscription = (subscriptionId, channelId) => {
    let data = getSubscription();

    if (!data[subscriptionId]) {
        data[subscriptionId] = [];
    }

    if (!data[subscriptionId].includes(channelId)) {
        return false;
    }

    data[subscriptionId] = data[subscriptionId].filter(id => id !== channelId);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4), 'utf8');

    return true;
}

module.exports = {
    getSubscription,
    addSubscription,
    removeSubscription
};
