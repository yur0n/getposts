import mongoose from 'mongoose'

const schema = new mongoose.Schema ({
    key: String,
	value: Object
}, { minimize: false })

export default mongoose.model('user', schema)
