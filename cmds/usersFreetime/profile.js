const { MessageEmbed } = require('discord.js')
const rainbow = require('../../utils/rainbow.js')
const readWrite = require('../../utils/readWriteFile.js')
const marryClipboard = new Map()

module.exports.run = async (client, message, args, command) => {
  const user = message.mentions.users.first() || message.author
  const member = await message.guild.members.fetch(user.id)
  const profile = readWrite.profile(user.id)
  switch (command) {
    case 'profile':
      const embed = new MessageEmbed()
        .setColor(rainbow())
        .setTitle('Profile')
        .setAuthor(
          member.nickname || user.username,
          user.avatarURL(),
          'https://discord.js.org'
        )
        .setThumbnail(user.avatarURL())
        .addField(`😎 Активы`, profile.coins + currency)
        .addField('🎉 Birthday', profile.birthday || 'Не указан')
        .addField('💖 Married with', profile.marry || 'Не в браке')
        .addField('📜 about', profile.about || 'Не указан')
        .setTimestamp()
      message.reply(embed)
      break

    case 'birthday':
      if (user.id !== message.author.id) return
      const birthday = args[0].split(/[-/|]/).join('-')
      if (!/[0-3]\d-(0\d|1[012])-\d{4}/.test(birthday))
        return message.reply('invalid date')
      profile.birthday = birthday
      readWrite.profile(message.author.id, profile)
      message.react('✅')
      break

    case 'about':
      if (user.id !== message.author.id) return
      profile.about = args.slice(0, 500).join(' ').replace(/\\n/g, '\n')
      readWrite.profile(user.id, profile)
      message.react('✅')
      break

    case 'marry':
      if (user.id === message.author.id) return
      const firstProfile = readWrite.profile(message.author.id)
      const secondProfile = profile

      if (marryClipboard.get(user.id) === message.author.id) {
        marryClipboard.delete(user.id)
        firstProfile.marry = member.toString()
        secondProfile.marry = message.member.toString()

        readWrite.profile(message.author.id, firstProfile)
        readWrite.profile(user.id, secondProfile)
				message.react('✅')
      } else {
        const firstUserId = message.author.id
				marryClipboard.set(firstUserId, user.id)
				message.react('⏳')
      }
      break

    case 'tear':
      if (user.id !== message.author.id) return
      const secondUserId = profile.marry.match(/(\d{15,})/)[1]
      const secondProfileTear = readWrite.profile(secondUserId)
      profile.marry = null
      secondProfileTear.marry = null

      readWrite.profile(message.author.id, profile)
      readWrite.profile(secondUserId, secondProfileTear)
      message.react('✅')
      break
  }
}

module.exports.help = {
  names: ['profile', 'birthday', 'about', 'marry', 'tear'],
  cmdList: true,
}
