import axios from "axios"


export async function deleteMsg(ctx, chat, msg) {
	ctx.api.deleteMessage(chat, msg)
}

export async function deleteMsgTime(ctx, chat, msg, time = 2500) {
	setTimeout(() => { ctx.api.deleteMessage(chat, msg) }, time)
}

export async function checkToken(ctx) {
	const token = ctx.message.text
	const ok = new RegExp(/^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/).test(token)
	if (!ok) return false
	return await axios.get(`https://api.telegram.org/bot${token}/getMe`)
		.then(async (res) => {
			const data = res.data.result
			ctx.session.bots[data.username] = { name: data.first_name || data.username, id: data.id,
				token: token, pause: false, sources: { youtube: [], vk: [] }, targets: [] }
			return true
		})
		.catch(() => false)
}

export async function listBots (items, range, submenu) {
	let i = 0
	if (!Array.isArray(items)) items = Object.keys(items)
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

export async function listTargets (items, range) {
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

export async function listSources (items, range) {
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
