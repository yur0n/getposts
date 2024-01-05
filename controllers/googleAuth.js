import {google} from 'googleapis';
import User from '../models/users.js';

const YOUR_CLIENT_ID = '117644416177-tlacpuvguv1vrlhrprmtaa8476ufdlgj.apps.googleusercontent.com'
const YOUR_CLIENT_SECRET = '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'
const YOUR_REDIRECT_URL = 'https://yuron.xyz/api/googleauth'

const oauth2Client = new google.auth.OAuth2(
	YOUR_CLIENT_ID,
	YOUR_CLIENT_SECRET,
	YOUR_REDIRECT_URL
);

const scopes = [
  'https://www.googleapis.com/auth/youtube'
];

const googleAuthURL = function (state) {
	return oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
		access_type: 'offline',
		scope: scopes,
		state: state
	})
};

oauth2Client.on('tokens', async (tokens) => {
	try {
		if (tokens.refresh_token) {
			const user = User.findOne({ data: {
				auth: {
				  	googleAuth: {
					  	refresh_token: tokens.refresh_token
				  	}
			  	}
			}})
			if (!user) {
				return console.log('Google user not found for refresh token')
			}
			user.data.auths.googleAuth = tokens
			user.markModified('data')
			await user.save()
		}
	}
	catch (e) {
		console.log('Problem with database updating googleAuth tokens\n', e)
	}
});


const googleAuth = async function (req, res) {
	const key = req.query.state
    const code = req.query.code
	const {tokens} = await oauth2Client.getToken(code)
	try {
		const user = await User.findOne({ key })
		if (!user) return res.send('Auth tokens not saved')
		user.data.auths.googleAuth = tokens
		user.markModified('data')
		await user.save()
	}
	catch (e) {
		console.log('Problem with database using googleAuth\n', e)
		return res.send('Auth tokens not recived')
	}

	res.send('done')
}
export { googleAuth, googleAuthURL, oauth2Client };