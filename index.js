const axios = require('axios')
const cron = require('node-cron')

const sendMsg = async () => {
	axios.post('https://api.telegram.org/bot1756916114:AAHutD0mn_OWLFyX6J43deLG0RY-hNLMjL8/sendMessage', {
		chat_id: '@na53Nq',
		text: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Calcutta' }),
	})
}

cron.schedule('* * * * *', () => {
	sendMsg()
})
