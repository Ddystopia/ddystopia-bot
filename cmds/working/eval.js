module.exports.run = async message => {
  if (
    !message.member.hasPermission('ADMINISTRATOR') &&
    message.author.id !== '630767319257317378'
  )
    return

  const code = `(async () => {
		${message.content.match(/(?<=.+?eval)(.+)/)[1]}
	})()`

  eval(code).catch(error => {
    message.channel.send(
      `There was an error:
			\`${error.message}\``
    )
  })
}

module.exports.help = {
  name: 'eval',
}
