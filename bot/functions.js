import axios from "axios"

export async function deleteMsg(ctx, chat, msg) {
	ctx.api.deleteMessage(chat, msg)
}

export async function deleteMsgTime(ctx, chat, msg, time = 2500) {
	setTimeout(() => { ctx.api.deleteMessage(chat, msg) }, time)
}

export async function replyAndDel(ctx, text, time = 2500) {
	const msg = await ctx.reply(text)
	setTimeout(() => { ctx.api.deleteMessage(msg.chat.id, msg.message_id) }, time)
}

export async function isAdmin(ctx, chat_id) {
	const token = ctx.session.bots[ctx.session.current.bot].token
	const botId = ctx.session.bots[ctx.session.current.bot].id
	return await axios.post(`https://api.telegram.org/bot${token}/getChatMember?chat_id=${chat_id}&user_id=${botId}`)
		.then(res => res.data.result.status === 'administrator' || res.data.result.status === 'moderator')
		.catch(() => false)
}

export async function checkToken(ctx) {
	const token = ctx.message.text
	const ok = new RegExp(/^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/).test(token)
	if (!ok) return false
	return await axios.get(`https://api.telegram.org/bot${token}/getMe`)
		.then(async (res) => {
			const data = res.data.result
			ctx.session.bots[data.username] = { name: data.first_name || data.username, id: data.id,
				token: token, options: { pause: false, links: 0 }, sources: { youtube: [], vk: [] }, targets: [] }
			return true
		})
		.catch(() => false)
}

export async function listBots (ctx, range, submenu) {
	const items = Object.keys(ctx.session.bots)
	let i = 0
	// if (!Array.isArray(items)) items = Object.keys(items)
	// if (items.length < 2) items.push('Free Bot slot')
	items.forEach(el => {
		if (i % 2) {
			range
			.text('🤖   ' + el, ctx => {
				ctx.session.current.bot = el
				ctx.menu.nav(submenu)
			}).row()
			return i++
		}
		range
		.text('🤖  ' + el, ctx => {
			ctx.session.current.bot = el
			ctx.menu.nav(submenu)
		})
		i++
	});
}

export async function listTargets (ctx, range) {
	const items = ctx.session.bots[ctx.session.current.bot].targets
	let i = 0
	if (!Array.isArray(items)) items = Object.keys(items)
	items.forEach(el => {
		if (i % 2) {
			range
			.text('❌ ' + el, async ctx => {
				const index = await items.indexOf(el)
				await ctx.session.bots[ctx.session.current.bot].targets.splice(index, 1)
				ctx.menu.update()
			}).row()
			return i++
		}
		range
		.text('❌ ' + el, async ctx => {
			const index = await items.indexOf(el)
			await ctx.session.bots[ctx.session.current.bot].targets.splice(index, 1)
			ctx.menu.update()
		})
		i++
	});
}

export async function listSources (ctx, range) {
	const items = ctx.session.bots[ctx.session.current.bot].sources[ctx.session.current.a]
	let i = 0
	if (!Array.isArray(items)) items = Object.keys(items)
	items.forEach(el => {
		if (i % 2) {
			range
			.text('❌ ' + el, async ctx => {
				const index = await items.indexOf(el)
				await ctx.session.bots[ctx.session.current.bot].sources[ctx.session.current.a].splice(index, 1)
				ctx.menu.update()
			}).row()
			return i++
		}
		range
		.text('❌ ' + el, async ctx => {
			const index = await items.indexOf(el)
			await ctx.session.bots[ctx.session.current.bot].sources[ctx.session.current.a].splice(index, 1)
			ctx.menu.update()
		})
		i++
	});
}

export async function options(ctx, range) {
	range
	.text(
		ctx => ctx.session.bots[ctx.session.current.bot].options.pause ? '✅ Pause Bot' : '⏹️ Pause Bot',
		ctx => {
			ctx.session.bots[ctx.session.current.bot].options.pause = !ctx.session.bots[ctx.session.current.bot].options.pause
			ctx.menu.update()
		}
	)
	.row()
	.text(
		ctx => {
			return '🔗 Links rule: ' + (() => {
				const links = ctx.session.bots[ctx.session.current.bot].options.links
				if(links === 0) return 'Keep links in posts     | ✅⏹️⏹️'
				if(links === 1) return 'Delete links in posts | ⏹️✅⏹️'
				if(links === 2) return 'Skip posts with links | ⏹️⏹️✅'
			})()
		},
		async ctx => {
			const links = ctx.session.bots[ctx.session.current.bot].options.links
			ctx.session.bots[ctx.session.current.bot].options.links = await (links + 1) % 3
			ctx.menu.update()
		}
	)
}
