const { SlashCommandBuilder } = require('discord.js');
const { addSubscription, removeSubscription } = require('../utils/subscriptions');

const subscriptionChoices = [
    { name: '채용 공고', value: 'jobListTask' }
];

const actionChoices = [
    { name: '추가', value: 'add' },
    { name: '제거', value: 'remove' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscription')
        .setDescription('구독을 관리합니다.')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('구독 추가 또는 제거')
                .setRequired(true)
                .addChoices(...actionChoices)
        )
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('구독 종류 선택')
                .setRequired(true)
                .addChoices(...subscriptionChoices)
        ),
    async execute(interaction) {
        const channelId = interaction.channel.id;
        const actionValue = interaction.options.getString('type');
        const subscriptionValue = interaction.options.getString('id');

        const selectedSubscription = subscriptionChoices.find(choice => choice.value === subscriptionValue);
        const subscriptionName = selectedSubscription ? selectedSubscription.name : '알 수 없음';

        const selectedAction = actionChoices.find(choice => choice.value === actionValue);
        const actionName = selectedAction ? selectedAction.name : '알 수 없음';

        try {
            const result = actionValue === 'add' ? addSubscription(subscriptionValue, channelId) : removeSubscription(subscriptionValue, channelId);

            const message = result
                ? `✅ '${subscriptionName}' 구독이 ${actionName}되었습니다.`
                : `❌ 구독 ${actionName}에 실패했습니다.`;

            await interaction.reply({ content: message, ephemeral: !result });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `⚠️ 오류 발생: ${error.message}`, ephemeral: true });
        }
    }
};
