module.exports.run = async message => {
  if (message.author.id !== '630767319257317378') return
  if (['token'].some(elem => message.content.includes(elem)))
    return message.channel.send('Это слишком личное >///<')

  const code = `(async () => {
		${
      (message.content.match(/```js(.+)```/ms) ||
        message.content.match(/(?<=.+?eval)(.+)/ms))[1]
    }
	})()`

  eval(code).catch(error => {
    message.channel.send(error.message, { code: 'bash', split: true })
  })
}

module.exports.help = {
  name: 'eval',
}
