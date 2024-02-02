import {google} from 'googleapis';
import User from '../models/users.js';

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URL
);

google.options({
	auth: oauth2Client
});

const youtube = google.youtube({ version: 'v3' })

const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly',
//   'https://www.googleapis.com/auth/userinfo.profile',
//   'https://www.googleapis.com/auth/userinfo.email',
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
	if (!tokens.refresh_token) return
	try {
		const user = await User.findOne({ value: {
			auths: {
				googleAuth: {
					refresh_token: tokens.refresh_token
				}
			}
		}})
		if (!user) return
		user.value.auths.googleAuth = {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token
		}
		user.markModified('value')
		await user.save()
	}
	catch (e) {
		console.log('Problem with database updating googleAuth tokens\n', e)
	}
});


const googleAuth = async function (req, res) {
	const key = req.query.state
    const code = req.query.code
	if (!code || !key) return res.send('Auth tokens not recived')
	try {
		const user = await User.findOne({ key })
		if (!user) return res.send('Authentication tokens not saved')
		const {tokens} = await oauth2Client.getToken(code)
		user.value.auths.googleAuth.access_token = tokens.access_token
		if (tokens.refresh_token) user.value.auths.googleAuth.refresh_token = tokens.refresh_token
		user.markModified('value')
		await user.save()
		res.send('Authenticated, you can close the page now')
	}
	catch (e) {
		console.log('Problem with database using googleAuth\n', e)
		return res.send('Authentication tokens not recived')
	}
}
export { googleAuth, googleAuthURL, oauth2Client, youtube };
