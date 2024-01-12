import vkWork from './workers/vkWork.js'
import youtubeWork from './workers/youtubeWork.js'
import { oauth2Client } from './controllers/googleAuth.js'
import User from './models/users.js'

async function worker() {
	try {
		const users = await User.find()
		users.forEach(user => {
			const bots = user.value.bots
			const googleTokens = user.value.auths.googleAuth
			const vkToken = user.value.auths.vkAuth
			const otherService = 0 // to be implemented
			if (Object.keys(bots).length === 0) return // maybe delete
			if (googleTokens?.refresh_token) oauth2Client.setCredentials(googleTokens)

			for (const bot in bots) {
				const botToken = bots[bot].token
				const options = bots[bot].options
				if (options.pause) return
				if (googleTokens.refresh_token) {
					bots[bot].sources.youtube.forEach( source => {
						bots[bot].targets.forEach(async target => {
							await youtubeWork(source, target, botToken, options)
						})
					})
				}
				if (vkToken) {
					bots[bot].sources.vk.forEach( source => {
						bots[bot].targets.forEach(async target => {
							await vkWork(source, target, botToken, vkToken, options)
						})
					})
				}
				if (otherService) {

				}
			}
		})
	} catch (e) {
		console.log('Error in worker:\n\n', e)
	}
}

setInterval(worker, 600_000) //18_000_000