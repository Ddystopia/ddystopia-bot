const { readdirSync } = require('fs')
const path = require('path')

module.exports.run = async (message, args) => {
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return
  if (!args.length)
    return message.channel.send(
      `You didn't pass any command to reload, ${message.author}!`
    )
  const commandName = args[0].toLowerCase()
  const command =
    message.client.commands.get(commandName) ||
    message.client.commands.find(
      ({ help }) => help.aliases && help.aliases.includes(commandName)
    )

  if (!command)
    return message.channel.send(
      `There is no command with name or alias \`${commandName}\`, ${message.author}!`
    )

  const dir = readdirSync(path.join(__dirname, '../')).find(dir => {
    try {
      require.cache[require.resolve(`../${dir}/${command.help.name}.js`)]
      return true
    } catch (err) {
      return false
    }
  })

  delete require.cache[require.resolve(`../${dir}/${command.help.name}.js`)]

  try {
    const newCommand = require(`../${dir}/${command.help.name}.js`)
    message.client.commands.set(newCommand.help.name, newCommand)
    message.channel.send(`Command \`${command.help.name}\` was reloaded!`)
  } catch (error) {
    console.error(error)
    message.channel.send(
      `There was an error while reloading a command \`${command.help.name}\`:
			\`${error.message}\``
    )
  }
}

module.exports.help = {
  name: 'reload',
}
