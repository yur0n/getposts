import { deleteMsg, replyAndDel, checkToken, isAdmin } from './functions.js'
import { InlineKeyboard } from 'grammy'


const bigmsg = "To use Get Posts you must create your bot that will be an admin of your channels and chats. What should you do:\n\n"+
"1. Run @BotFather and send /newbot command to him\n"+
"2. Enter bot name (can be anything, like: Bot Editor)\n"+
"3. Enter bot login — which ends with bot — like: mysuperbot\n"+
"4. With previous steps done, @BotFather will send you a message which contains <b>TOKEN</b> — key of your bot — "+
"click the TOKEN to copy it and <b><i>send it to this chat</i></b>.\n"+
"\nMake your bot an admin of your channel so he can send messages to the channel.\n\n"+
"<b>Bot you connect here should not be used by other services!</b>"
const targetMsg = 'You can have up to 4 Telegram channels/groups connected to 1 bot.'+ 
'\n\nSend me a link to the Telegram channel where your bot is an admin and press OK.\n\nExample: https://t.me/RandomTGChannel'
const youtubeMsg = 'Send me YouTube Channel ID.\n\nExamples: UCvdrYSJ1itgZEH19wWnSHcg'
const vkMsg = 'Send me link to the group you want to adde.\n\nExample: https://vk.com/RandomGroup2h2'
const linkReg = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g


export async function addBot(conversation, ctx) {
	const ask = await ctx.reply(bigmsg, {
		parse_mode: "HTML",
		reply_markup: new InlineKeyboard().text('🚫 Cancel')
	});
	ctx = await conversation.wait();
	if (ctx.update.callback_query?.data) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return
	}
	for (let bot in ctx.session.bots) {
		if (ctx.session.bots[bot].token === ctx.message.text) {
			await deleteMsg(ctx, ask.chat.id, ask.message_id)
			return replyAndDel(ctx, `ℹ️ You've added this bot already`)
		}
	}
	if (await checkToken(ctx)) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		replyAndDel(ctx, '✅ Bot Added!')
	}
	else {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		replyAndDel(ctx, '⛔ Wrong TOKEN')
	}
}

export async function addSource(conversation, ctx) {
	const current = ctx.session.current.a
	const msg = current === 'youtube' ? youtubeMsg : vkMsg
	const ask = await ctx.reply(msg, {
		parse_mode: "HTML",
		reply_markup: new InlineKeyboard().text('🚫 Cancel')
	});
	ctx = await conversation.wait();
	if (ctx.update.callback_query?.data) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return
	}
	let source = ctx.msg.text
	if (current !== 'youtube') {
		if (!source.match(linkReg)) {
			await deleteMsg(ctx, ask.chat.id, ask.message_id)
			return replyAndDel(ctx, `⛔ Wrong link format`)
		}
		source = source.split("/")[3]
	}
	if (current === 'youtube') {
		if(!source.match(/^UC[a-zA-Z0-9-]{15,25}$/)) {
			await deleteMsg(ctx, ask.chat.id, ask.message_id)
			return replyAndDel(ctx, `⛔ Wrong Channel ID`)
		}
	}
	if (ctx.session.bots[ctx.session.current.bot].sources[current].includes(source)) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return replyAndDel(ctx, `ℹ️ You've added this source already`)
	}
	ctx.session.bots[ctx.session.current.bot].sources[current].push(source)
	await deleteMsg(ctx, ask.chat.id, ask.message_id)
	replyAndDel(ctx, '✅ Source Added!')
}

export async function addTarget(conversation, ctx) {
	const ask = await ctx.reply(targetMsg, {
		parse_mode: "HTML",
		reply_markup: new InlineKeyboard().text('🚫 Cancel')
	});
	ctx = await conversation.wait();
	if (ctx.callbackQuery?.data) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return
	}
	if (!ctx.message.text.match(linkReg)) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return replyAndDel(ctx, `⛔ Wrong link format`)
	}
	const target = "@" + ctx.msg.text.split("/")[3]
	if (ctx.session.bots[ctx.session.current.bot].targets.includes(target)) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return replyAndDel(ctx, `ℹ️ You've added this target already`)
	}
	if (!await isAdmin(ctx, target)) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return replyAndDel(ctx, `ℹ️ Bot is not an admin of the group/channel`, 6000)
	}
	ctx.session.bots[ctx.session.current.bot].targets.push(target)
	await deleteMsg(ctx, ask.chat.id, ask.message_id)
	return replyAndDel(ctx, '✅ Target Added!')
}

export async function confirm(conversation, ctx) {
	let ask = await ctx.reply('Are you sure you want to delete this bot?', {
		reply_markup: new InlineKeyboard().text('🚫 Cancel').text('⚠️ Yes, DELETE!')
	});
	ctx = await conversation.waitForCallbackQuery(['🚫 Cancel', '⚠️ Yes, DELETE!']);
	if (ctx.callbackQuery.data === '⚠️ Yes, DELETE!') {
		delete ctx.session.bots[ctx.session.current.bot]
	}
	await deleteMsg(ctx, ask.chat.id, ask.message_id)
}