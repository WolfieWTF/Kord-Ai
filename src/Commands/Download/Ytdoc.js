const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const emojis = {
    search: '🔍',
    processing: '🔄',
    done: '✅',
    error: '❌',
    warning: '⚠️'
};

module.exports = {
    usage: ["ytdoc", "youtubedoc", "ytmp4"],
    desc: "Download YouTube videos as documents.",
    commandType: "Download",
    isGroupOnly: false,
    isAdminOnly: false,
    isPrivateOnly: false,
    emoji: "📄",

    async execute(sock, m, args) {
        try {
            const MAXDLSIZE = settings.MAX_DOWNLOAD_SIZE * 1024 * 1024; // Convert MB to bytes
            const url = args[0];
            await global.kord.react(m, emojis.search);

            if (!url) {
                return await global.kord.reply(m, "🔗 Please provide a YouTube video URL.");
            }

            // Check if it's a valid YouTube URL
            const validYouTubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
            if (!validYouTubeRegex.test(url)) {
                await global.kord.react(m, emojis.error);
                return await global.kord.reply(m, "🚫 Please provide a valid YouTube URL.");
            }

            await global.kord.react(m, emojis.processing);

            // Use Gifted API to get video info
            const apiUrl = `https://api.giftedtechnexus.co.ke/api/download/ytdl?url=${encodeURIComponent(url)}&apikey=gifted`;
            const response = await fetch(apiUrl);
            const videoInfo = await response.json();

            if (!videoInfo || videoInfo.status !== 200 || !videoInfo.result || !videoInfo.result.video_url) {
                await global.kord.react(m, emojis.error);
                console.log("API Response Error: ", videoInfo);
                return await global.kord.reply(m, "❌ Unable to fetch the video. Please try again later.");
            }

            const downloadUrl = videoInfo.result.video_url;
            const videoTitle = videoInfo.result.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, ''); // Clean title for file name
            const fileExtension = 'mp4';

            // Download the file
            const fileResponse = await fetch(downloadUrl);
            const fileBuffer = await fileResponse.buffer();

            const fileSize = fileBuffer.length;

            if (fileSize > MAXDLSIZE) {
                await global.kord.react(m, emojis.warning);
                return await global.kord.reply(m, `${emojis.warning} The file size (${(fileSize / 1024 / 1024).toFixed(2)} MB) exceeds the maximum allowed size (${settings.MAX_DOWNLOAD_SIZE} MB).`);
            }

            const tempDir = path.join('./temp');
            try {
                await fs.access(tempDir); // Check if directory exists
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // Directory doesn't exist, create it
                    await fs.mkdir(tempDir);
                } else {
                    throw error; // Propagate other errors
                }
            }

            const tempFilePath = path.join(tempDir, `${videoTitle}.${fileExtension}`);
            await fs.writeFile(tempFilePath, fileBuffer);

            // Use the same caption as the youtube command
            const captionLine = `🎥 *KORD-AI YOUTUBE-DOWNLOADER* 🎥\n\n🔗 Link: ${videoInfo.result.url}\n📽️ Title: ${videoInfo.result.title}\n🕒 Duration: ${videoInfo.result.duration}`;

            // Send the video as a document with the title as the file name
            await global.kord.sendDocument(m, await fs.readFile(tempFilePath), 'video/mp4', `${videoTitle}.${fileExtension}`, captionLine);

            // Clean up
            await fs.unlink(tempFilePath);

            await global.kord.react(m, emojis.done);

        } catch (error) {
            await global.kord.react(m, emojis.error);
            console.log("Error during execution:", error);
            if (error.message.includes('network')) {
                await global.kord.reply(m, "🌐 Hmm, having trouble connecting to the internet. Please try again later.");
            } else if (error.message.includes('404')) {
                await global.kord.reply(m, "🚫🔗 The video is no longer available. Please check the URL and try again.");
            } else {
                await global.kord.reply(m, "🤖 Oops! Something unexpected happened. We'll look into it.");
            }
        }
    }
};