import 'dotenv/config'
import './database/connection.js'
import express from 'express'
const app = express()
import './bot.js'
import './workers/youtubeWork.js'
import { googleAuth } from './controllers/googleAuth.js'
import vkAuth from './controllers/vkAuth.js'

app.use(express.json())

app.get('/', (req, res) => {
	res.send('Website to maintain Get Posts project')
})
app.get('/api/googleAuth', googleAuth)
app.get('/api/vkAuth', vkAuth)

export default app;

// for production
// import bot from './bot.js'
// app.use(await bot.createWebhook({ domain: 'http://yuron.xyz/bot' }));