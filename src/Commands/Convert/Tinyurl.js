const fetch = require('node-fetch');

module.exports = {
    usage: ["tinyurl", "shorturl"],
    desc: "Generate a shortened URL using TinyURL from the provided URL or quoted text",
    commandType: "Utility",
    isGroupOnly: false,
    isAdminOnly: false,
    isPrivateOnly: false,
    emoji: "🔗",

    async execute(sock, m, args) {
        let originalUrl;

        if (args.length > 0) {
            originalUrl = args[0];
        } else {
            originalUrl = await global.kord.getQuotedText(m);
        }

        if (!originalUrl) {
            return await global.kord.reply(m, "❌ Please provide or quote a URL to shorten.\nMake sure the url has `https://`");
        }

        const url = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`;

        try {
            const response = await fetch(url);
            const shortenedUrl = await response.text();

            if (shortenedUrl.includes('http')) {
                await global.kord.freply(m, `🔗 Shortened URL: ${shortenedUrl}`);
            } else {
                await global.kord.reply(m, "❌ Failed to shorten the URL.\n Make sure the url has `https://`.");
            }
        } catch (error) {
            await global.kord.reply(m, `❌ Error shortening the URL: ${error.message}`);
        }
    }
};