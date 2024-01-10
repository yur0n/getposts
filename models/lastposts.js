import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    domain: 'string',
    chat_id: "string",
    bot: 'string',
    post: 'number',
	link: 'string'
})

export default mongoose.model('lastpost', schema)