module.exports = {
    usage: ["toqr"],
    desc: "Generates a QR code from text",
    commandType: "utility",
    isGroupOnly: false,
    isAdminOnly: false,
    isPrivateOnly: false,
    emoji: "📱",

    async execute(sock, m, args) {
        if (!args[0]) return await global.kord.freply(m, 'Please provide text to convert to a QR code');

        const text = args.join(' ');
        const encodedText = encodeURIComponent(text);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodedText}`;

        try {
            // Assuming you have a function to send images
            await kord.sendImage(m, qrUrl, 'Here is your QR code:');
        } catch (error) {
            console.error('Error generating QR code', error.message);
            await global.kord.freply(m, `❌ An error occurred: ${error.message}`);
        }
    }
};