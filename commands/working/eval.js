module.exports.run = async message => {
  if (
    !message.member.hasPermission('ADMINISTRATOR') &&
    message.author.id !== '630767319257317378'
  )
    return
  if (['token', 'process'].some(elem => message.content.includes(elem)))
    return message.channel.sand('Это слишком личное >///<')

  const code = `(async () => {
		${message.content.match(/(?<=.+?eval)(.+)/)[1]}
	})()`

  eval(code).catch(error => {
    message.channel.send(error.message, { code: 'bash' })
  })
}

module.exports.help = {
  name: 'eval',
}
