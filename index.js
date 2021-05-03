const express = require('express')
const app = express()

app.get('/', (req, res) => {
	res.send('The app is on!')
})

const config = require('platformsh-config').config()
app.listen(config.port)

// only the code below matters

const axios = require('axios')
const cron = require('node-cron')
const tulind = require('tulind')

const na53Nq = async (pair, volume = 0) => {
	axios.post('https://api.telegram.org/bot1756916114:AAHutD0mn_OWLFyX6J43deLG0RY-hNLMjL8/sendMessage', {
		chat_id: '@na53Nq',
		text: new Date().toLocaleTimeString('en-US'),
	})

	const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr')

	const resData = []

	for (element of res.data) {
		if (element.symbol.endsWith(pair) && !element.symbol.endsWith(`UP${pair}`) && !element.symbol.endsWith(`DOWN${pair}`) && !element.symbol.endsWith(`BULL${pair}`) && !element.symbol.endsWith(`BEAR${pair}`) && element.quoteVolume > volume) {
			resData.push({
				symbol: element.symbol,
				volume: element.quoteVolume,
			})
		}
	}

	symbols = resData.sort((a, b) => b.volume - a.volume)

	for (element of symbols) {
		axios.post('https://api.telegram.org/bot1756916114:AAHutD0mn_OWLFyX6J43deLG0RY-hNLMjL8/sendMessage', {
			chat_id: '@na53Nq',
			text: count++,
		})

		const res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${element.symbol}&interval=15m&limit=100`)

		const _volume = []
		for (values of res.data) {
			_volume.push(parseFloat(values[5]))
		}

		const _open = []
		for (values of res.data) {
			_open.push(parseFloat(values[1]))
		}

		const _high = []
		for (values of res.data) {
			_high.push(parseFloat(values[2]))
		}

		const _low = []
		for (values of res.data) {
			_low.push(parseFloat(values[3]))
		}

		const _close = []
		for (values of res.data) {
			_close.push(parseFloat(values[4]))
		}

		Object.assign(element, { volume: _volume, open: _open, high: _high, low: _low, close: _close })

		await tulind.indicators.ema.indicator([element.close], [192], (err, results) => {
			const _ema960 = results[0]

			Object.assign(element, { ema960: _ema960 })
		})

		await tulind.indicators.ema.indicator([element.close], [96], (err, results) => {
			const _ema480 = results[0]

			Object.assign(element, { ema480: _ema480 })
		})

		const red = element.ema960.slice(-3)
		const green = element.ema480.slice(-3)

		if (red[0] > green[0] && red[1] < green[1]) {
			const status = `${++count} ${element.symbol} ~ LONG`

			axios.post('https://api.telegram.org/bot1756916114:AAHutD0mn_OWLFyX6J43deLG0RY-hNLMjL8/sendMessage', {
				chat_id: '@na53Nq',
				text: status + ' ~ ' + _close[_close.length - 1],
			})
		}

		if (red[0] < green[0] && red[1] > green[1]) {
			const status = `${++count} ${element.symbol} ~ SHORT`

			axios.post('https://api.telegram.org/bot1756916114:AAHutD0mn_OWLFyX6J43deLG0RY-hNLMjL8/sendMessage', {
				chat_id: '@na53Nq',
				text: status + ' ~ ' + _close[_close.length - 1],
			})
		}
	}
}

cron.schedule('*/15 * * * *', () => {
	setTimeout(() => {
		na53Nq('USDT')
	}, 7000)
})
