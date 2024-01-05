import { connect, set } from "mongoose"

set('strictQuery', true)

connect(`mongodb+srv://yur0n:786512@cluster0.0na8y.mongodb.net/getposts?retryWrites=true&w=majority`)