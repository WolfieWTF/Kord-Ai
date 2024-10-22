const { getGroupParticipants } = require('@whiskeysockets/baileys'); // Import the function to get group participants

module.exports = {
    usage: ['tagall'],
    description: 'Tag all members in the group.',
    emoji: '📢',
    commandType: 'Group',
    isGroupOnly: true,
    IsAdminOnly: true,

    async execute(sock, m, args) {
        const groupId = m.key.remoteJid;

        try {
            const groupMetadata = await sock.groupMetadata(groupId); // Fetch group metadata
            const participants = groupMetadata.participants;
            const mentions = participants.map(participant => participant.id);

            let message = `
╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
      *Attention everyone!*
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯

`;

            participants.forEach((participant, index) => {
                message += `
┊ ✦ *${index + 1}.* @${participant.id.split('@')[0]}`;
            });

            await sock.sendMessage(groupId, {
                text: message,
                mentions: mentions
            }, { quoted: m }); // Reply to the caller's message

        } catch (error) {
            console.error('Error tagging all members:', error);
            await sock.sendMessage(groupId, {
                text: "An error occurred while trying to tag all members. Please try again later."
            }, { quoted: m }); // Reply to the caller's message
        }
    }
};