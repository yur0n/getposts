import axios from 'axios';
import { youtube } from '../controllers/googleAuth.js'
import Lastpost from '../models/lastposts.js'

export default async (source, target, bot) => {
	try {
		const link = await getVideo(source)
		if(!link) return
		let lastpost = await Lastpost.findOne({ domain: source, chat_id: target, bot })
		if (!lastpost) {
			lastpost= new Lastpost({ domain: source, chat_id: target, bot, link })
			await lastpost.save()
		} else if (link === lastpost.link) return
		lastpost.link = link
		await lastpost.save()
		await axios.post(`https://api.telegram.org/bot${bot}/sendMessage`, {chat_id: target, text: link})
	} catch(e) { console.log('Error in youtubeWork:\n\n', e) }
}

async function getVideo(channel) {
	try {
		// const playlistId = await getPlaylistId(channel)
		// if(!playlistId) return false
		const playlistId = channel.replace('C', 'U')
		const getVideo = await youtube.playlistItems.list({
			part: 'snippet',
			playlistId: playlistId,
			maxResults: 1
		})
		const videoId = getVideo.data.items[0].snippet.resourceId.videoId;
		return 'https://www.youtube.com/watch?v='+videoId
	} catch (e) {
		console.log('Error finding video:', e.errors)
		return false
	}
}

// async function getPlaylistId(channel) {
// 	try {
// 		const getChannel = await youtube.search.list({
// 			part: ['snippet', 'id'],
// 			maxResults: 10,
// 			regionCode: 'US',
// 			q: channel,
// 			type: 'channel'
// 		})
// 		return getChannel.data.items[0].id.channelId.replace('C', 'U')
// 	} catch (e) {
// 		console.log('Error finding channel:', e.errors)
// 		return false
// 	}
// }