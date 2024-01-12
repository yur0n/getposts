import { replyAndDel, deleteMsgTime, listBots, listSources, listTargets, options } from './functions.js'
import { googleAuthURL } from '../controllers/googleAuth.js'
import { Menu } from "@grammyjs/menu"

const menuKey = new Menu('main-menu')
	.submenu('|      🤖 My Bots      |', 'bots-menu')
	.submenu('|  🔑 Authentication   |', 'auths-menu')

const authsKey = new Menu('auths-menu')
	.dynamic((ctx, range) => {
		const ytLink = googleAuthURL(ctx.from.id)
		const vkLink = process.env.VK_AUTH_LINK + ctx.from.id
		range
      		.url('|     🆔 YouTube    |', ytLink)
			.url('|       🆔 VK       |', vkLink)
	}).row()
	.back('⬅️ Go back')

const botsKey = new Menu('bots-menu')
	.dynamic((ctx, range) => listBots(ctx, range, 'bot-menu')).row()
	.text(
		ctx => '➕ Add new Bot',
		async ctx => {
			if (Object.keys(ctx.session.bots).length >= 2) {
				return replyAndDel(ctx, `ℹ️ You've used all available Bot slots. Buy slot for Bot`, 6000)
			}
			await ctx.conversation.enter('addBot')
			ctx.menu.nav('main-menu')
		}
	)
	.text('🛍️ Buy Bot slot').row()
	.back('⬅️ Go back')

const botKey = new Menu('bot-menu')
	.submenu('📥 Sources', 'source-menu')
	.text('📨 Targets',
		async ctx => {
			ctx.session.current.a = 'targets'
			ctx.menu.nav('targets-menu')
		}).row()
	.submenu('Options', 'options-menu')
	.text('❌ Delete Bot',
		async ctx => {
				await ctx.conversation.enter('confirm')
				ctx.menu.nav('main-menu')
		}
	)
	.back('⬅️ Go back')

const sourceKey = new Menu('source-menu')
	.text('🌐 YouTube',   
		async ctx => {
			if (!ctx.session.auths.googleAuth.access_token) {
				replyAndDel(ctx, `ℹ️ You have to authenticate YouTube first`,  4000)
				return ctx.menu.nav('auths-menu')
			}
			ctx.session.current.a = 'youtube'
			ctx.menu.nav('sources-menu')
		}
	)
	.text('🌐 VK',
		async ctx => {
			if (!ctx.session.auths.vk) {
				replyAndDel(ctx, `ℹ️ You have to authenticate VK first`,  4000)
				return ctx.menu.nav('auths-menu')
			}
			ctx.session.current.a = 'vk'
			ctx.menu.nav('sources-menu')
		}
	).row()
	.text('🛍️ Buy source slot')
	.back('⬅️ Go back')

const sourcesKey = new Menu('sources-menu')
	.dynamic((ctx,range) => listSources(ctx, range))
	.row()
	.text('➕ Add Source',
		async ctx => {
			let i = 0
			const sources = ctx.session.bots[ctx.session.current.bot].sources
			for (let source in sources) i += sources[source].length
			if (i >= 4 ) {
				return replyAndDel(ctx, `ℹ️ You've used all available Source slots for this Bot. Buy one more slot`, 7000)
			}
			await ctx.conversation.enter('addSource')
		})
	.back('⬅️ Go back')

const targetsKey = new Menu('targets-menu')
	.dynamic((ctx,range) => listTargets(ctx, range)).row()
	.text('➕ Add Target',
		async ctx => {
			if (ctx.session.bots[ctx.session.current.bot].targets.length >= 4 ) {
				return replyAndDel(ctx, `ℹ️ You've used all available Target slots for this Bot. Buy one more slot`, 7000)
			}
			await ctx.conversation.enter('addTarget')
		})
	.text('🛍️ Buy target slot').row()
	.back('⬅️ Go back')

const optionsKey = new Menu('options-menu')
	.dynamic((ctx, range)  => options(ctx, range)).row()
	.back('⬅️ Go back')


sourceKey.register(sourcesKey)
botKey.register([sourceKey, targetsKey, optionsKey])
botsKey.register(botKey)
menuKey.register([botsKey, authsKey])

export default menuKey
