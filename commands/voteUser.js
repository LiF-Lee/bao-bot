const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voteuser')
        .setDescription('특정 유저를 대상으로 담금질 투표를 시작합니다.')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('담금질할 유저의 @멘션 또는 ID를 입력하세요.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ 음성 채팅방에 있어야 명령어를 사용할 수 있습니다.', ephemeral: true });
        }

        const voiceChannels = interaction.guild.channels.cache
            .filter(channel => channel.type === 2 && channel.id !== voiceChannel.id);

        if (voiceChannels.size < 1) {
            return interaction.reply({ content: '❌ 담금질을 실행할 추가적인 음성 채널이 없습니다.', ephemeral: true });
        }

        const targetUserInput = interaction.options.getString('user');
        const targetUserId = targetUserInput.replace(/[<@!>]/g, '');
        const targetMember = voiceChannel.members.get(targetUserId);

        if (!targetMember) {
            return interaction.reply({ content: '❌ 해당 유저가 현재 보이스 채널에 없습니다.', ephemeral: true });
        }

        const members = voiceChannel.members.filter(member => !member.user.bot);
        if (members.size < 3) {
            return interaction.reply({ content: '❌ 투표를 진행하려면 최소 3명 이상이 있어야 합니다.', ephemeral: true });
        }

        const requiredVotes = Math.ceil(members.size / 2);
        const votes = { yes: new Set(), no: new Set() };

        let embed = new EmbedBuilder()
            .setTitle(`🔥 ${targetMember.displayName}에 대한 담금질 투표`)
            .setDescription('찬성하면 👍, 반대하면 👎를 눌러주세요.')
            .setColor(0x0099ff)
            .addFields(
                { name: '👍 찬성', value: '0표', inline: true },
                { name: '👎 반대', value: '0표', inline: true }
            )
            .setFooter({ text: `과반수 (${requiredVotes}표) 이상이면 결정됩니다.` });

        const voteMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
        await voteMessage.react('👍');
        await voteMessage.react('👎');

        const updateEmbed = async () => {
            embed.setFields(
                { name: '👍 찬성', value: `${votes.yes.size}표`, inline: true },
                { name: '👎 반대', value: `${votes.no.size}표`, inline: true }
            );
            await voteMessage.edit({ embeds: [embed] });
        };

        const filter = (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name);
        const collector = voteMessage.createReactionCollector({ filter, time: 15000 });

        collector.on('collect', async (reaction, user) => {
            if (!members.has(user.id)) {
                await reaction.users.remove(user);
                return;
            }

            if (reaction.emoji.name === '👍') {
                votes.yes.add(user.id);
                votes.no.delete(user.id);
                await voteMessage.reactions.cache.get('👎')?.users.remove(user);
            } else if (reaction.emoji.name === '👎') {
                votes.no.add(user.id);
                votes.yes.delete(user.id);
                await voteMessage.reactions.cache.get('👍')?.users.remove(user);
            }

            updateEmbed();

            if (votes.yes.size >= requiredVotes) {
                collector.stop();
                embed
                    .setDescription(`✅ **${targetMember.displayName}**에 대한 담금질이 시작됩니다!`)
                    .setColor(0x00ff00);
                await voteMessage.edit({ embeds: [embed] });
            } else if (votes.no.size >= requiredVotes) {
                collector.stop();
                embed
                    .setDescription(`❌ 반대가 과반수를 넘었습니다. 담금질이 취소되었습니다.`)
                    .setColor(0xff0000);
                await voteMessage.edit({ embeds: [embed] });
            }
        });

        collector.on('end', async () => {
            if (votes.yes.size >= requiredVotes) {
                embed
                    .setDescription(`✅ **${targetMember.displayName}**에 대한 담금질이 시작됩니다!`)
                    .setColor(0x00ff00);
                await voteMessage.edit({ embeds: [embed] });

                const targetChannel = voiceChannels.first();
                await startForging(interaction, targetMember, voiceChannel, targetChannel);
            } else {
                embed
                    .setDescription(`❌ 과반수를 넘지 못했습니다. 담금질이 취소되었습니다.`)
                    .setColor(0xff0000);
                await voteMessage.edit({ embeds: [embed] });
            }
        });
    }
};

async function startForging(interaction, targetMember, originalChannel, alternateChannel) {
    if (!alternateChannel) {
        return interaction.followUp({ content: '❌ 담금질을 진행할 보이스 채널이 부족합니다.', ephemeral: true });
    }

    let swap = false;
    let startTime = Date.now();

    const movingInterval = setInterval(async () => {
        if (!targetMember.voice.channel) {
            clearInterval(movingInterval);
            return interaction.followUp({ content: `❌ **${targetMember.displayName}**가 음성 채널을 나갔습니다. 담금질을 종료합니다.`  });
        }

        if (Date.now() - startTime >= 10000) {
            clearInterval(movingInterval);
            if (targetMember.voice.channel) {
                await targetMember.voice.setChannel(originalChannel).catch(() => {});
            }
            return interaction.followUp({ content: `🔥 **${targetMember.displayName}**의 담금질이 종료되었습니다! 원래 방으로 복귀합니다.` });
        }

        if (targetMember.voice.channel) {
            const targetChannel = swap ? originalChannel : alternateChannel;
            await targetMember.voice.setChannel(targetChannel).catch(() => {});
            swap = !swap;
        }
    }, 1000);
}
