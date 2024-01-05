import express from 'express'
const app = express()
import './bot.js'
import { googleAuth } from './controllers/googleAuth.js'

app.use(express.json())
// for production
// import bot from './bot.js'
// app.use(await bot.createWebhook({ domain: 'http://yuron.xyz/bot' }));

app.get('/', (req, res) => {
	res.send('Website to maintain Get Posts project')
})

app.get('/api/googleAuth', googleAuth)

app.get('/api/vkAuth', (req, res) => {
	res.send('ok')
})


export default app;