import vkWork from './workers/vkWork.js'
import youtubeWork from './workers/youtubeWork.js'
import { oauth2Client } from './controllers/googleAuth.js'
import User from './models/users.js'
import cron from 'node-cron'

let time = 0
// const time0 = 10 minutes 600_000
// const time1 = 60 minutes 3_600_000
// const time2 = 300 minutes 18_000_000
const timeArr = [1, 2, 3, 4, 5]

async function worker() {
	if (time === 300) time = 0
	time += 10
	try {
		const users = await User.find()
		users.forEach(user => {
			const bots = user.value.bots
			const googleTokens = user.value.auths.googleAuth
			const vkToken = user.value.auths.vkAuth
			const otherService = 0 // to be implemented
			if (!Object.keys(bots).length) return // maybe delete
			if (googleTokens?.refresh_token) oauth2Client.setCredentials(googleTokens)

			for (const bot in bots) {
				const botToken = bots[bot].token
				const options = bots[bot].options
				if (options.pause) continue
				if (options.time === 0) {}
				else if (options.time === 1 && timeArr.includes(time/60)) {}
				else if (options.time === 2 && timeArr.includes(time/300)) {}
				else continue 
				if (googleTokens?.refresh_token) {
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

cron.schedule('*/10 * * * *', () => {
	worker();
});