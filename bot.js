
import { Bot, session } from 'grammy'
import { conversations, createConversation } from "@grammyjs/conversations";
import { MongoDBAdapter } from "@grammyjs/storage-mongodb"

import collection from './models/users.js'
import { addBot, addItem, confirm } from './bot/conversations.js'
import menuKey from './bot/menus.js'
import { deleteMsgTime, deleteMsg } from './bot/functions.js';

const bot = new Bot(process.env.BOT_TOKEN)

bot.on('message', (ctx, next) => {
	if (ctx.msg.text === '/start') {
		deleteMsgTime(ctx, ctx.message.chat.id, ctx.message.message_id, 60_000)
		return next()
	} 
	deleteMsg(ctx, ctx.message.chat.id, ctx.message.message_id)
	next()
})

bot.use(session({
    initial: () => ({
		username: '',
		id: '',
		first_name: '',
        auths: { 
			googleAuth: { access_token: '' }, 
			vkAuth: '' 
		},
		bots: {},
		current: {}
    }),
   storage: new MongoDBAdapter({ collection }),
}));

bot.use(conversations());
bot.use(createConversation(addBot));
bot.use(createConversation(addItem));
bot.use(createConversation(confirm));
bot.use(menuKey)

bot.command('start', async ctx => {
	({ username: ctx.session.username, id: ctx.session.id, first_name: ctx.session.first_name } = ctx.from)
	await ctx.reply("Menu",{
		reply_markup: menuKey,
	});
})

bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	// if (e instanceof GrammyError) {
	if (e.description) {
	  console.error("Error in request:", e.description);
	// } else if (e instanceof HttpError) {
	//   console.error("Could not contact Telegram:", e);
	} else {
	  console.error("Unknown error:", e);
	}
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();