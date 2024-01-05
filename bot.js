import axios from 'axios'
import {googleAuthURL} from './controllers/googleAuth.js'
import { Telegraf, Markup, session} from 'telegraf'
import sessionDb from './session/session.js'
import './youtubeWork.js'

const bot = new Telegraf('6869453749:AAFk7RV49SN5fmIMIag_EWyYAyv6yyRUF2M')
bot.use(session({ defaultSession: () => ({ menu: 0 }) }));
bot.use(sessionDb('user'))
bot.use((ctx, next) => {console.log(ctx.session.menu)
	next()})

const mainMSG = "To use Get Posts you must create your bot that will be an admin of your channels and chats. What should you do:\n\n"+
"1. Run @BotFather and send /newbot command to him\n"+
"2. Enter bot name (can be anything, like: Bot Editor)\n"+
"3. Enter bot login — which ends with bot — like: mysuperbot\n"+
"4. With previous steps done, @BotFather will send you a message which contains TOKEN — key of your bot — click the TOKEN to copy it and send it to this chat.\n"+
"\nMake your bot an admin of your channel so he can send messages to the channel. Write any message in your channel, feel free to delete it right away"+
"(this action is mandatory because the bot needs to be aware he's in the chat).\n\n"+
"The bot you connect here should not be used by other services!"

//KEYBOARDS

function mainMenu() {
	return Markup.inlineKeyboard([
		[Markup.button.callback('My bots','myBots'),
		Markup.button.callback('Auths', 'auths')],
		//[Markup.button.callback('Exit', 'deleteLastMsg menu')]
	])
}

function botOptions() {
	return Markup.inlineKeyboard([
		[Markup.button.callback('Sources','sources'),
		Markup.button.callback('Targets', 'targets')],
		[Markup.button.callback('Delete bot', 'deleteBot'),
		Markup.button.callback('Back', 'myBots')]
	])
}

function sourcesList(ctx) {
	return Markup.inlineKeyboard([
		[Markup.button.callback('YouTube','sources youtube'),
		Markup.button.callback('VK', 'sources vk')],
		[Markup.button.callback('Back', 'bot '+ ctx.session.bot)]
	])
}

function ok(what) {
	return Markup.inlineKeyboard([
		[Markup.button.callback('OK', what)]
	])
}

function listButtons(what, value, buttons) {
	if (!value) value = []
	let arr = []
	let arr2 = []
	let i = 0
	if (!Array.isArray(value)) value = Object.keys(value) // check if you want to list bots because bots is object and channels is array
	value.forEach(el => {
		if (i % 2) {
			arr2.push(Markup.button.callback(el, what+' '+el))
			arr.push(arr2)
			arr2 = []
			i++
			return
		}
		arr2.push(Markup.button.callback(el, what+' '+el))
		i++
		})
	arr.push(arr2, buttons)
	return Markup.inlineKeyboard(arr).resize()  
}

//ACTIONS

bot.action('mainMenu', async ctx => {
	await ctx.answerCbQuery()
	await ctx.editMessageText('Main Menu', mainMenu(ctx))
})

bot.action(/deleteLastMsg (.+)/, async ctx => {
	await ctx.deleteMessage()
	if (ctx.match[1] === 'fromStart') {
		return {message_id: ctx.session.menu} = await ctx.reply('Main Menu', mainMenu(ctx))
	}
})

//BOTS

bot.action('myBots', async ctx => {
	const value = ctx.user.bots
	await ctx.answerCbQuery()
	await ctx.editMessageText ('My Bots', listButtons('bot', value,
		[Markup.button.callback('Add new bot', 'addBot'), Markup.button.callback('Back', 'mainMenu')]))
})

bot.action(/bot (.+)/, async ctx => {
	ctx.session.bot = ctx.match[1]
	await ctx.answerCbQuery()
	await ctx.editMessageText ('Current bot: ' + ctx.match[1], botOptions())

})

bot.action('deleteBot', async ctx => {
	const value = ctx.user.bots
	delete value[ctx.session.bot]
	await ctx.answerCbQuery('BOT DELETED')
	await ctx.editMessageText('Bot deleted', ok('myBots'))
	
})

bot.action('addBot', async ctx => {
	await ctx.answerCbQuery()
	ctx.session.start = await ctx.editMessageText(mainMSG, Markup.inlineKeyboard([
		Markup.button.callback('Cancel', 'myBots')
	]))
})

//SOURCES

bot.action('sources', async ctx => {
	if (!ctx.session.bot) return ctx.editMessageText('Main Menu', mainMenu(ctx))
	await ctx.answerCbQuery()
	await ctx.editMessageText('Sources for ' + ctx.session.bot, sourcesList(ctx))
})    

bot.action(/sources (.+)/, async ctx => {
	if (!ctx.session.bot) return ctx.editMessageText('Main Menu', mainMenu(ctx))
	await ctx.answerCbQuery()
	const value = await ctx.user.bots[ctx.session.bot].sources[ctx.match[1]]
	await ctx.editMessageText(`${ctx.match[1]} sources for ${ctx.session.bot}. Choose source you want to delete`,
		listButtons('source ' + ctx.match[1], value, [Markup.button.callback('Add source',
		'addsource ' + ctx.match[1]), Markup.button.callback('Back', 'sources')]))

})

bot.action(/source (.+) (.+)/, async ctx => { //delete source
	const index = await ctx.user.bots[ctx.session.bot].sources[ctx.match[1]].indexOf(ctx.match[2])
    await ctx.user.bots[ctx.session.bot].sources[ctx.match[1]].splice(index, 1)
	await ctx.answerCbQuery('SOURCE DELETED')
	await ctx.editMessageText(`${ctx.match[1]} source ${ctx.match[2]} deleted`, ok('sources ' + ctx.match[1]))
})

bot.action(/addsource (.+)/, async ctx => {
	await ctx.answerCbQuery()
	let i = 0
	const sources = ctx.user.bots[ctx.session.bot].sources
	for (let source in sources) i += sources[source].length
	if (i >= 4) {
		return ctx.editMessageText('You cannot add more sources (4 max). Feel free to delete unwanted sources',
		ok('sources ' + ctx.match[1]))
	}
	if (ctx.match[1] === 'youtube')
	ctx.editMessageText('You can have up to 4 sources connected to 1 bot.'+ 
	'\n\nSend me a link to the YouTube channel where your bot is an admin and press OK.\n\nExample: https://youtube.com/RandomYTChannel',
		Markup.inlineKeyboard([
			Markup.button.callback('Cancel', 'sources ' + ctx.match[1])
		]))
	if (ctx.match[1] === 'vk')
	ctx.editMessageText('You can have up to 4 groups connected to 1 bot.'+
	'\n\nSend me link to the group you want to add and press OK.\n\nExample: https://vk.com/RandomGroup2h2',
		Markup.inlineKeyboard([
			Markup.button.callback('Cancel', 'sources ' + ctx.match[1])
		]))
	ctx.session.sourceAdd = ctx.match[1]
})

//TARGETS

bot.action('targets', async ctx => {
	await ctx.answerCbQuery()
	if (!ctx.session.bot) return ctx.editMessageText('My Bots', mainMenu(ctx))
	const value = await ctx.user.bots[ctx.session.bot].targets
	await ctx.editMessageText(`Targets for ${ctx.session.bot}. Choose target you want to delete`,
		listButtons('target', value, [Markup.button.callback('Add target',
		'addtarget'), Markup.button.callback('Back', 'bot '+ ctx.session.bot)]))
})    

bot.action(/target (.+)/, async ctx => {
	const index = await ctx.user.bots[ctx.session.bot].targets.indexOf(ctx.match[1])
    await ctx.user.bots[ctx.session.bot].targets.splice(index, 1)
	await ctx.answerCbQuery('TARGET DELETED')
	await ctx.editMessageText(`${ctx.match[1]} target deleted`, ok('targets'))
})

bot.action('addtarget', async ctx => {
	await ctx.answerCbQuery()
	if (ctx.user.bots[ctx.session.bot].targets.length >= 4) {
		return ctx.editMessageText('You cannot add more targets (4 max). Feel free to delete unwanted targets', ok('targets'))
	}
	ctx.session.targetAdd = true
	ctx.editMessageText('You can have up to 4 Telegram channels connected to 1 bot.'+ 
	'\n\nSend me a link to the Telegram channel where your bot is an admin and press OK.\n\nExample: https://t.me/RandomTGChannel',
		Markup.inlineKeyboard([
			Markup.button.callback('Cancel', 'targets')
		]))
})

// ADD SOURCE OR TARGET

bot.hears(/[a-zA-Z]+:\/\/[a-zA-Z]+\.[a-zA-Z]+\/[A-Za-z0-9]+/, async (ctx, next)=> {
	if (ctx.session.sourceAdd) await addSource(ctx)
	if (ctx.session.targetAdd) await addTarget(ctx)
	next()
})

async function addSource (ctx) {
	const mainSource = ctx.session.sourceAdd
	let source = ''
	ctx.session.sourceAdd = false
	if (mainSource === 'youtube') source = ctx.match[0].slice(20)
	if (mainSource === 'vk') source = ctx.match[0].slice(15)
	if (ctx.user.bots[ctx.session.bot].sources[mainSource].includes(source)) {
		await ctx.deleteMessage(ctx.session.menu)
		return {message_id: ctx.session.menu} = await ctx.reply(`You already have this source in your sources list`, ok('sources ' + mainSource))
	}
	await ctx.user.bots[ctx.session.bot].sources[mainSource].push(source)
	console.log(ctx.session.menu)
	await ctx.deleteMessage(ctx.session.menu)
	return {message_id: ctx.session.menu} = await ctx.reply(`${source} source sucessfully added`, ok('sources ' + mainSource))
}

async function addTarget (ctx) {
	ctx.session.targetAdd = false
	const target = "@" + ctx.match[0].slice(13)
	if (ctx.user.bots[ctx.session.bot].targets.includes(target)) {
		await ctx.deleteMessage(ctx.session.menu)
		return {message_id: ctx.session.menu} = await ctx.reply(`You already have this target in your targets list`, ok('targets'))
	}
	await ctx.user.bots[ctx.session.bot].targets.push(target)
	await ctx.deleteMessage(ctx.session.menu)
	return {message_id: ctx.session.menu} = await ctx.reply(`${target} target sucessfully added`, ok('targets'))
}

//AUTHS

bot.action('auths', async ctx => {
	await ctx.answerCbQuery()
	await ctx.editMessageText ('Authorize services for your bots', Markup.inlineKeyboard([
		[Markup.button.url('YouTube', googleAuthURL(`${ctx.from.id}:${ctx.chat.id}`)),
		Markup.button.url('VK', 'https://www.vk.com/')],
		[Markup.button.callback('Back', 'mainMenu')]
	  ]))
})

// COMMANDS

bot.command('start', async (ctx, next) => {
	({ username: ctx.user.username, id: ctx.user.id, first_name: ctx.user.first_name } = ctx.from)
	ctx.user.auths = ctx.user.auths || { googleAuth: {}, vkAuth: '' }
	ctx.user.bots = ctx.user.bots || {}
	ctx.session.start = await ctx.replyWithHTML(mainMSG, Markup.inlineKeyboard([
		Markup.button.callback('Go to Menu. I will add bot later', 'deleteLastMsg fromStart')
	]))
	next()
})

// bot.command('menu', async ctx => {
// 	console.log(ctx.session.menu)
// 	if (ctx.session.menu) {
// 		await ctx.deleteMessage(ctx.session.menu)
// 	}
// 	const message = await ctx.reply('Main Menu', mainMenu()) 
// 	ctx.session.menu = message.message_id
// })

// BOT ADDITION PROCESS

bot.hears(/^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/, async (ctx, next) => {
	let message
	if (Object.keys(ctx.user.bots).length >= 4) {
		message = ctx.reply(`You can't add more bots (4 max). Feel free to delete unwanted bots`,  mainMenu(ctx))
		setTimeout(() => ctx.deleteMessage(message.message_id), 4000)
		return next()
	}
	
	for (let bot in ctx.user.bots) {
		if (ctx.user.bots[bot].token === ctx.message.text) {
			message = await ctx.reply(`You've added this bot already`)
			setTimeout(() => ctx.deleteMessage(message.message_id), 2500)
			return next()
		}
	}
	await axios.get(`https://api.telegram.org/bot${ctx.match[0]}/getMe`)
	.then(async (res) => {
		if (!res.data.ok) {
			message = await ctx.reply('Wrong TOKEN')
			setTimeout(() => ctx.deleteMessage(message.message_id), 2500)
			return next()
		}
		let data = res.data.result
		ctx.user.bots[data.username] = { name: data.first_name || data.username,
			id: data.id, token: ctx.message.text, sources: { youtube: [], vk: [] }, targets: [] }

		if (ctx.session.start) await ctx.deleteMessage(ctx.session.start.message_id)
		if (ctx.session.menu) await ctx.deleteMessage(ctx.session.menu)
		
		const menu = await ctx.reply('Main Menu', mainMenu(ctx)) 
		ctx.session.menu = menu.message_id
		message = await ctx.reply('BOT ADDED')
		setTimeout(() => ctx.deleteMessage(message.message_id), 2500)
		return next()
	})
  	.catch((e) => {
    	message = ctx.reply('Wrong TOKEN')
		setTimeout(() => ctx.deleteMessage(message.message_id), 2500)
    	console.log("Bot add failed:", e)
		next()
 	})
})

// DELETING ALL MESSAGES TO KEEP CHAT CLEAN

bot.on('message', async (ctx, next) => {
	if (ctx.message.text === '/start') {
		setTimeout(() => ctx.deleteMessage(), 60_500)
		return next()
	} 
	await ctx.deleteMessage()
	next()
})

// bot.command("image", ctx =>
// 	ctx.replyWithPhoto({ url: "https://picsum.photos/200/300/?random" }),
// );

bot.catch((err, ctx) => {
	console.log(err)
	console.log(`Error for ${ctx.updateType} \nDetails:`)
})

bot.launch();
  
  // Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
  
  
process.on('uncaughtException', (err, origin) => {
	console.log(`Caught exception: ${err}\n` + `Exception origin: ${origin}`)
});

export default bot