import { deleteMsg, deleteMsgTime, checkToken } from './functions.js'
import { InlineKeyboard } from 'grammy'


const bigmsg = "To use Get Posts you must create your bot that will be an admin of your channels and chats. What should you do:\n\n"+
"1. Run @BotFather and send /newbot command to him\n"+
"2. Enter bot name (can be anything, like: Bot Editor)\n"+
"3. Enter bot login — which ends with bot — like: mysuperbot\n"+
"4. With previous steps done, @BotFather will send you a message which contains <b>TOKEN</b> — key of your bot — click the TOKEN to copy it and <b><i>send it to this chat</i></b>.\n"+
"\nMake your bot an admin of your channel so he can send messages to the channel. <b>Write any message in your channel</b>, feel free to delete it right away (this action is mandatory because bot needs to be aware he's in the chat).\n\n"+
"<b>Bot you connect here should not be used by other services!</b>"
const targetMsg = 'You can have up to 4 Telegram channels connected to 1 bot.'+ 
'\n\nSend me a link to the Telegram channel where your bot is an admin and press OK.\n\nExample: https://t.me/RandomTGChannel'
const youtubeMsg = 'Send me a link to the YouTube channel.\n\nExample: https://youtube.com/RandomYTChannel'
const vkMsg = 'Send me link to the group you want to addr.\n\nExample: https://vk.com/RandomGroup2h2'



export async function addBot(conversation, ctx) {
	const oldctx = ctx
	let ask = await ctx.reply(bigmsg, {
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
			ask = await ctx.reply(`ℹ️ You've added this bot already`)
			return deleteMsgTime(ctx, ask.chat.id, ask.message_id)
		}
	}
	const add = await conversation.external(() => checkToken(ctx))
	if (add) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		ask = await ctx.reply("✅ Bot Added!")
		deleteMsgTime(ctx, ask.chat.id, ask.message_id)
	}
	else {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		ask = await ctx.reply('⛔ Wrong TOKEN')
		deleteMsgTime(ctx, ask.chat.id, ask.message_id)
	}
}

export async function addItem(conversation, ctx) {
	const current = ctx.session.current.a
	let msg;
	if (current === 'youtube') msg = youtubeMsg
	else if (current === 'vk') msg = vkMsg
	else if (current === 'targets') msg = targetMsg
	let ask = await ctx.reply(msg, {
		parse_mode: "HTML",
		reply_markup: new InlineKeyboard().text('🚫 Cancel')
	});
	ctx = await conversation.wait();
	if (ctx.update.callback_query?.data) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		return
	}
	let item = ctx.message.text
	// if (!new RegExp(/[a-zA-Z]+:\/\/[a-zA-Z]+\.[a-zA-Z]+\/[A-Za-z0-9]+/).test(item)) {
	// 	await deleteMsg(ctx, ask.chat.id, ask.message_id)
	// 	ask = await ctx.reply(`⛔ Wrong link format`)
	// 	return deleteMsgTime(ctx, ask.chat.id, ask.message_id)
	// }
	// if (current === 'youtube') item = item.slice(20)
	if (current === 'vk') item = item.slice(15)
	if (current === 'targets') {
		item = "@" + item.slice(13)
		if (ctx.session.bots[ctx.session.current.bot].targets.includes(item)) {
			await deleteMsg(ctx, ask.chat.id, ask.message_id)
			ask = await ctx.reply(`ℹ️ You've added this target already`)
			return deleteMsgTime(ctx, ask.chat.id, ask.message_id)
		}
		ctx.session.bots[ctx.session.current.bot].targets.push(item)
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		ask = await ctx.reply('✅ Target Added!')
		return deleteMsgTime(ctx, ask.chat.id, ask.message_id)

	}
	if (ctx.session.bots[ctx.session.current.bot].sources[current].includes(item)) {
		await deleteMsg(ctx, ask.chat.id, ask.message_id)
		ask = await ctx.reply(`ℹ️ You've added this source already`)
		return deleteMsgTime(ctx, ask.chat.id, ask.message_id)
	}
	ctx.session.bots[ctx.session.current.bot].sources[current].push(item)
	await deleteMsg(ctx, ask.chat.id, ask.message_id)
	ask = await ctx.reply('✅ Source Added!')
	deleteMsgTime(ctx, ask.chat.id, ask.message_id)
}

export async function confirm(conversation, ctx) {
	let ask = await ctx.reply('Are you sure you want to delete this bot?', {
		parse_mode: "HTML",
		reply_markup: new InlineKeyboard().text('🚫 Cancel').text('⚠️ Yes, DELETE!')
	});
	ctx = await conversation.waitForCallbackQuery(['🚫 Cancel', '⚠️ Yes, DELETE!']);
	if (ctx.callbackQuery.data === '⚠️ Yes, DELETE!') {
		delete ctx.session.bots[ctx.session.current.bot]
	}
	await deleteMsg(ctx, ask.chat.id, ask.message_id)
}