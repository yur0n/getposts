import axios from 'axios'
import User from '../models/users.js'

export default async (req, res) => {
	const code = req.query.code
	const state = req.query.state
	if (!code || !state) res.send('No data to authorize')
    axios.get(process.env.VK_REDIRECT_LINK + code)
    .then(async data => {
        const user = await User.findOne({ key: state })
	    if (!user) {
			return res.send('Your token is not connected to Get Posts, write to support')
		}
        user.value.auths.vkAuth = data.data.access_token
	    user.markModified('value')
        await user.save()
        res.send('Authorized, you can close the page now') 
    }).catch((e) => {
        console.log(e)
        res.send('Not authorized, something went wrong') 
    })
}