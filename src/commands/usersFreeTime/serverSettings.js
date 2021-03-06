const { Guild } = require('../../models/Guild')
const { rainbow } = require('../../utils/rainbow')
const { MessageEmbed } = require('discord.js')
const commands = [
  'server',
  'prefix',
  'logChannel',
  'baseRole',
  'ideaChannel',
  'bankruptRole',
  'greetingChannel',
  'blacklist',
  'imageChannels',
  'noCommandsChannels',
  'wordsGameChannels',
]

module.exports.run = async (message, args = [], propCommand) => {
  if (!message.member.hasPermission('ADMINISTRATOR'))
    return message.reply('Ути-пути, детям сюда нельзя, позовите взрослых.')
  const guildDB = await Guild.getOrCreate(message.guild.id)
  const command = commands.find(cmd => cmd.toLowerCase() === propCommand.toLowerCase())
  switch (command) {
    case 'server': {
      const { guild } = message
      const embed = new MessageEmbed()
        .setColor(rainbow())
        .setTitle('Информация о сервере')
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: 'Владелец', value: `**${guild.owner}**`, inline: true },
          { name: 'Пользователей', value: `**${guild.memberCount}**`, inline: true },
          {
            name: 'Создан',
            value: `**${new Date(guild.createdAt).toLocaleString()}**`,
            inline: true,
          },
          { name: 'Регион', value: `**${guild.region}**`, inline: true },
          { name: 'Эмодзи', value: `**${guild.emojis.cache.size}**`, inline: true },
          { name: 'Ролей', value: `**${guild.roles.cache.size - 1}**`, inline: true },
          { name: 'Мой префикс', value: `**${guildDB.prefix}**` },
          {
            name: 'Канал для идей',
            value: guildDB.ideaChannel ? `<#${guildDB.ideaChannel}>` : 'Отсутствует',
            inline: true,
          },
          {
            name: 'Роль для новоприбывших',
            value: guildDB.baseRole ? `<@&${guildDB.baseRole}>` : 'Отсутствует',
            inline: true,
          },
          {
            name: 'Канал для приветствий',
            value: guildDB.greetingChannel
              ? `<#${guildDB.greetingChannel}>`
              : 'Отсутствует',
            inline: true,
          },
          {
            name: 'Каналы для вознаграждий за картинки',
            value: guildDB.imageChannels.length
              ? `<#${guildDB.imageChannels.join('><#')}>`
              : 'Отсутствуют',
            inline: true,
          },
          {
            name: 'Каналы с игнором комманд',
            value: guildDB.noCommandsChannels.length
              ? `<#${guildDB.noCommandsChannels.join('><#')}>`
              : 'Отсутствуют',
            inline: true,
          },
          {
            name: 'Каналы для игры в слова',
            value: guildDB.wordsGameChannels.length
              ? `<#${guildDB.wordsGameChannels.join('><#')}>`
              : 'Отсутствуют',
            inline: true,
          },
          {
            name: 'Роль для банкротов',
            value: guildDB.bankruptRole ? `<@&${guildDB.bankruptRole}>` : 'Отсутствует',
            inline: true,
          }
        )
        .setImage(guild.bannerURL())
        .setFooter(`id: ${guild.id}`)
      message.channel.send(embed)
      break
    }
    case 'prefix': {
      const prefix = args[0].toLowerCase()
      if (prefix.length > 3)
        return message.reply('Максимальная длинна префикса 3 символа')
      message.react('✅')
      guildDB.prefix = prefix
      guildDB.save()
      break
    }
    case 'baseRole':
    case 'bankruptRole':
      singleProp(message, args, command, guildDB, 'roles')
      break
    case 'logChannel':
    case 'ideaChannel':
    case 'greetingChannel':
      singleProp(message, args, command, guildDB, 'channels')
      break

    case 'blacklist': //blacklist of members, not of channels
      multipleProp(message, args, command, guildDB)
      break

    case 'wordsGameChannels': {
      const channelArray = args.join('|').match(/\d{15,}/g) || []
      if (
        !channelArray.length ||
        channelArray.some(ch => !message.guild.channels.cache.has(ch))
      )
        return
      if (args[0] === 'add')
        channelArray.forEach(async id => {
          const channel = message.guild.channels.cache.get(id)
          message.client.commands
            .get('cities')
            .run({ channel, onReady: true, guild: { id: guildDB.id } }, ['start'])
        })
    }
    // eslint-disable-next-line no-fallthrough
    case 'imageChannels':
    case 'noCommandsChannels':
      multipleProp(message, args, command, guildDB, true)
  }
}

const singleProp = (message, [mode, string = ''], channel, guildDB, filter) => {
  if (mode === 'clear') return (guildDB[channel] = null)

  const [id] = string.match(/\d{15,}/) || []
  if (filter && !message.guild[filter].cache.has(id))
    return message.reply('Что-то не правильно')
  if (
    filter === 'roles' &&
    message.guild.roles.cache.get(id).position >= message.guild.me.roles.highest.position
  )
    return message.reply('Извините, но эта роль слишком крута для простых смертных.')

  message.react('✅')
  guildDB[channel] = id
  if (mode === 'set') guildDB[channel] = id
  guildDB.save()
}

const multipleProp = (message, [mode, ...args], channel, guildDB, filter) => {
  const channelArray = args.join('|').match(/\d{15,}/g) || []
  if (
    !channelArray.length ||
    channelArray.some(ch => filter && !message.guild[filter].cache.has(ch))
  )
    return message.reply('Что-то не правильно')
  message.react('✅')
  if (mode === 'add') guildDB[channel] = guildDB[channel].concat(channelArray)
  else if (mode === 'remove')
    guildDB[channel] = guildDB[channel].filter(id => !channelArray.includes(id))

  guildDB.markModified(channel)
  guildDB.save()
}

module.exports.help = {
  name: 'serverSettings',
  aliases: commands,
}
