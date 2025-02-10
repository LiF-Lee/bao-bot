const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getJobList } = require('../utils/jobKorea');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joblist')
        .setDescription('게임잡에서 최신 채용 공고를 가져옵니다.')
        .addIntegerOption(option =>
            option.setName('size')
                .setDescription('불러올 공고 수 (최대 10)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const pageSize = interaction.options.getInteger('size') || 5;
        let currentPage = 1;
        let globalIndexOffset = 0;

        async function updateMessage(page, message) {
            const jobList = await getJobList(page, pageSize);

            if (jobList.length === 0) {
                await message.edit({ content: "❌ 채용 공고를 찾을 수 없습니다.", embeds: [], components: [] });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`📢 최신 게임업계 채용 공고 (페이지 ${page})\n\u200B`)
                .setColor(0x0099ff)
                .setTimestamp();

            jobList.forEach((job, index) => {
                embed.addFields({
                    name: `**${globalIndexOffset + index + 1}. ${job.jobTitle}**`,
                    value: `🔹 **회사:** ${job.company}\n🔹 **마감일:** ${job.deadline || "채용시"}\n🔹 **등록일:** ${job.postedTime}\n[🔗 공고 링크](${job.jobLink})\n\u200B`
                });
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setLabel('⬅ 이전 페이지')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 1),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('다음 페이지 ➡')
                    .setStyle(ButtonStyle.Primary)
            );

            await message.edit({ content: "", embeds: [embed], components: [row] });
        }

        const initialMessage = await interaction.editReply({ content: "🔄 데이터를 불러오는 중..." });
        await updateMessage(currentPage, initialMessage);

        const collector = initialMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                await buttonInteraction.reply({ content: "❌ 이 버튼을 사용할 수 없습니다.", ephemeral: true });
                return;
            }

            if (buttonInteraction.customId === 'prev_page') {
                if (currentPage > 1) {
                    currentPage -= 1;
                    globalIndexOffset -= pageSize;
                }
            } else if (buttonInteraction.customId === 'next_page') {
                currentPage += 1;
                globalIndexOffset += pageSize;
            }

            await buttonInteraction.deferUpdate();
            await updateMessage(currentPage, initialMessage);
        });

        collector.on('end', async () => {
            try {
                await initialMessage.edit({ components: [] });
            } catch (error) {
                console.error("❌ 메시지 업데이트 중 오류 발생:", error);
            }
        });
    }
};
