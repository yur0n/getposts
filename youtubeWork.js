import axios from 'axios';
import { google } from 'googleapis'
import { oauth2Client } from './controllers/googleAuth.js'
import User from './models/users.js';

const tokens = { access_token: 'ya29.a0AfB_byATV7MtPx1KKdiY7mGM0VsUXOquxRc4tUeugycf4e7CWWqUkTWpjlIDAZULgQzxBGnQD0pgpuc0eeqDvjRaA2kJLW9zdLNwOlmZdi6CH8WoRfQkJO76FLpjxsDOz_eb67vylz42lCQdYMpD-OSnKYb5J40Y6iAaCgYKARASARMSFQHGX2MiPxQHMygHircnYmbLdo-eAw0170' }
const channels = ['UUdC0An4ZPNr_YiFiYoVbwaw']
const bot = ''


function youtubeSearch(channels, tokens) {
	oauth2Client.setCredentials(tokens)
	const youtube = google.youtube({ version: 'v3', auth: oauth2Client})
	channels.forEach(channel => {
		youtube.playlistItems.list({
			part: 'snippet',
			playlistId: channel, //change UC to UU
			maxResults: 3
		}, (err, response) => {
			if (err) {
				console.error(err);
			} else {
				const uploads = response.data.items[0].snippet.resourceId.videoId;
				console.log(uploads)
			}
		});

	})
}

//youtubeSearch(channels, tokens)

