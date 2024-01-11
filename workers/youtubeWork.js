import axios from 'axios';
import { google } from 'googleapis'
import { oauth2Client } from '../controllers/googleAuth.js'
import User from '../models/users.js';
import Lastpost from '../models/lastposts.js'

const youtube = google.youtube({ version: 'v3', auth: oauth2Client})

async function worker() {
	try {
		const users = await User.find()
		users.forEach(user => {
			const bots = user.value.bots
			const googleTokens = user.value.auths.googleAuth
			const vkToken = user.value.auths.vkAuth
			const otherServiceToken = 0 // to be implemented
			if (Object.keys(bots).length === 0) return
			if (googleTokens?.access_token) oauth2Client.setCredentials(googleTokens)

			for (const bot in bots) {
				const botToken = bots[bot].token
				bots[bot].sources.youtube.forEach( source => {
					bots[bot].targets.forEach(async target => {
						await youtubeWork(source, target, botToken)
					})
				})
				if (vkToken) {
					bots[bot].sources.vk.forEach( source => {
						bots[bot].targets.forEach(async target => {
							await vkWork(source, target, botToken, vkToken)
						})
					})
				}
				if (otherServiceToken) {

				}
			}
		})
	} catch (e) {
		console.log('Error in worker:\n\n', e)
	}
}

async function youtubeWork(source, target, bot) {
	try {
		const link = await getVideo(source)
		let lastDomain = await Lastpost.findOne({ domain: source, chat_id: target, bot })
		if (!lastDomain) {
			lastDomain = new Lastpost({ domain: source, chat_id: target, bot, link })
			await lastDomain.save()
		} else if (link === lastDomain.link) return
		lastDomain.link = link
		await lastDomain.save()
		await axios.post(`https://api.telegram.org/bot${bot}/sendMessage`, {chat_id: target, text: link})
	} catch(e) { console.log('Error in youtubeWork:\n\n', e) }
}

async function getVideo(channel) {
	try {
		const playlistId = await getPlaylistId(channel)
		const getVideo = await youtube.playlistItems.list({
			part: 'snippet',
			playlistId: playlistId,
			maxResults: 3
		})
		const videoId = getVideo.data.items[0].snippet.resourceId.videoId;
		return 'https://www.youtube.com/watch?v='+videoId
	} catch (e) {
		console.log('Error finding video:\n\n', e)
	}
}

async function getPlaylistId(channel) {
	if (!channel) return
	try {
		const getChannel = await youtube.search.list({
			part: ['snippet', 'id'],
			maxResults: 10,
			regionCode: 'US',
			q: channel,
			type: 'channel'
		})
		return getChannel.data.items[0].id.channelId.replace('C', 'U')
	} catch (e) {
		console.log('Error finding channel:\n\n', e)
	}
}


// worker()