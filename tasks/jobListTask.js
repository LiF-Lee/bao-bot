const { EmbedBuilder } = require('discord.js');
const { getDate } = require('../utils/functions');
const { getJobList } = require('../utils/jobKorea');
const { getSubscription } = require('../utils/subscriptions');

module.exports = {
    name: 'jobListTask',
    interval: 3600000,
    async execute(client) {
        const { date, time } = getDate();
        console.log(`[${date} ${time}] Task Execute: ${this.name}`);

        const page = 1;
        const pageSize = 25;
        const jobList = await getJobList(page, pageSize);

        if (jobList.length === 0) {
            return;
        }

        const recentJobs = jobList.filter(job => {
            const timeText = job.postedTime.trim();

            if (timeText.includes("분 전")) {
                const minutesAgo = parseInt(timeText.replace("분 전", "").trim(), 10);
                return minutesAgo < 60;
            }

            return false;
        });

        if (recentJobs.length === 0) {
            return;
        }

        const now = new Date();
        const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9 (한국 시간)
        const currentHour = koreaTime.getUTCHours(); // KST 기준 시간

        const embed = new EmbedBuilder()
            .setTitle(`📢 ${String(currentHour).padStart(2, '0')}시 게임업계 채용 공고\n\u200B`)
            .setColor(0x0099ff)
            .setTimestamp();

        recentJobs.forEach((job, index) => {
            embed.addFields({
                name: `**${index + 1}. ${job.jobTitle}**`,
                value: `🔹 **회사:** ${job.company}\n🔹 **마감일:** ${job.deadline || "채용시"}\n🔹 **등록일:** ${job.postedTime}\n[🔗 공고 링크](${job.jobLink})\n\u200B`
            });
        });

        const subscription = getSubscription(this.name);
        for (const channelId of subscription) {
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                channel.send({ embeds: [embed] });
            }
        }
    }
};
