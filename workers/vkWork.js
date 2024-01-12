import axios from 'axios'
import Lastpost from '../models/lastposts.js'
import { text } from 'express'

const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

// have to be reworked
export default async (domain, chat_id, bot, access_token, options) => {
	const links = options.links
    axios.get("https://api.vk.com/method/wall.get", {
        params: {
            domain,
            access_token,
            count: 2,
            v: 5.131,
        }
    })
    .then(res => {
        let itemPosted = false
        res.data.response.items.forEach( async item => {
            if (itemPosted || item.is_pinned || item.marked_as_ads) return

            itemPosted = true
            
            let lastDomain = await Lastpost.findOne({ domain, chat_id, bot })

            if (!lastDomain) {
                lastDomain = new Lastpost({ domain, chat_id, bot, post: 0 })
                await lastDomain.save().catch(console.log)
            } else if (item.id <= lastDomain.post) return

			lastDomain.post = item.id
			await lastDomain.save().catch(console.log)

			let caption = item.text || item.copy_history[0]?.attachments[0].photo.text || 'Photo'

			if (caption.match(linkRegex))  {
				if (links === 1) caption = caption.replace(linkRegex, '');
				if (links === 2) return
			}

			if (checkClub) caption = caption.replace(/\[[a-z]+[0-9]+\|.*\]/g, '')            // Check in text [club2131|<<people.com>>]
			let photos = []
			let photoWidth = 0
			let photo = ''

			if (caption.length > 1024) {
				axios.post(`https://api.telegram.org/bot${bot}/sendMessage`, {chat_id, text: caption})
				.catch((e) => console.log(e.response.data))
				return
			}
			if (item.attachments[0]) {
				// if (item.copy_history[0].attachments[0].photo) photos = item.copy_history[0].attachments[0].photo.sizes 
				if (item.attachments[0].photo) photos = item.attachments[0].photo.sizes || []
				else if (item.attachments[0].video) photos = item.attachments[0].video.image || []
				else if (item.attachments[0].audio) photos = item.attachments[1].photo.sizes || []
				else if (item.attachments[0].link) photos = item.attachments[0].link.photo?.sizes || []
				photos.forEach(el => {
					if (el.width > photoWidth) {
						photoWidth = el.width
						photo = el.url
					}
				})
				axios.post(`https://api.telegram.org/bot${bot}/sendPhoto`, {chat_id, photo, caption})
				.catch((e) => console.log(e.response.data))
				return
			}

			axios.post(`https://api.telegram.org/bot${bot}/sendMessage`, {chat_id, text: caption})
			.catch((e) => console.log(e.response.data))      
        });
    })
    .catch((e) => console.log(e))   
}