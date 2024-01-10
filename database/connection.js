import mongoose from "mongoose"

//prod 1 is for getposts api reqeusts, non-prod (0) is for yuron.xyz api requests
const prod = 0
const address = prod ? process.env.MONGODB_CONNECTION_PROD : process.env.MONGODB_CONNECTION

mongoose.set('strictQuery', true)
await mongoose.connect(address)