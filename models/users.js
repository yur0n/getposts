import mongoose from 'mongoose'
import '../database/connection.js'

const schema = new mongoose.Schema({
    key: 'string',
    data: {},
})
export default mongoose.model('User', schema)