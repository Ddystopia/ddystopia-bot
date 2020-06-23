const { MessageEmbed } = require('discord.js')
const rainbow = require('../../utils/rainbow.js')
const { removeLoot } = require('../../utils/lootActions')
const readWrite = require('../../utils/readWriteFile.js')
const marryClipboard = new Map()

module.exports.run = async (client, message, args, command) => {
  const loot = readWrite.file('loot.json')
  const user = message.mentions.users.first() || message.author
  const member = await message.guild.members.fetch(user.id)
  const profile = readWrite.profile(user.id)
  switch (command) {
    case 'profile':
      const usersLoot = Object.entries(profile.loot)
        .sort((a, b) => loot[b[0]] - loot[a[0]])
        .map(line => `${line[0]}  :  ${line[1]}`)
        .join(' | ')

      const embed = new MessageEmbed()
        .setColor(rainbow())
        .setTitle('Profile')
        .setAuthor(
          member.nickname || user.username,
          user.avatarURL(),
          'https://discord.js.org'
        )
        .setThumbnail(user.avatarURL())
        .addField('🎩 Actives', Math.floor(profile.coins) + currency)
        .addField('😎 Reputation', profile.rep)
        .addField('🎉 Birthday', profile.birthday || 'Не указан', true)
        .addField('💖 Married with', profile.marry || 'Не в браке', true)
        .addField('🛍 Loot', usersLoot || 'Не имеет лута')
        .addField('📜 about', profile.about || 'Не указан')
        .setTimestamp()
      message.reply(embed)
      break

    case 'birthday':
      if (user.id !== message.author.id) return
      if (!args[0]) return
      const birthday = args[0].split(/[-/|\.]/).join('-')
      if (!/[0-3]\d-(0\d|1[012])-\d{4}/.test(birthday))
        return message.reply('invalid date')
      profile.birthday = birthday
      readWrite.profile(message.author.id, profile)
      message.react('✅')
      break

    case 'about':
      const ownProfile = readWrite.profile(message.author.id)
      ownProfile.about = args.slice(0, 100).join(' ').replace(/\\n/g, '\n')
      readWrite.profile(message.author.id, ownProfile)
      message.react('✅')
      break

    case 'rep':
      if (user.id === message.author.id) return
      const SECONDS_COOLDOWN = 60 * 50
      if (Date.now() - profile.timers.rep < 1000 * SECONDS_COOLDOWN)
        return message.react('❌')

      profile.timers.rep = Date.now()
      profile.rep++
      message.react('✅')
      readWrite.profile(user.id, profile)
      break

    case 'marry':
      if (user.id === message.author.id) return
      const firstProfile = readWrite.profile(message.author.id)
      const secondProfile = profile

      if (!!firstProfile.marry || !!secondProfile.marry)
        return message.reply('Кто-то из вас двоих уже в отношениях')
      if (!firstProfile.loot['💍'] || !secondProfile.loot['💍'])
        return message.reply('У кого-то из вас нет кольца')

      if (marryClipboard.get(user.id) === message.author.id) {
        marryClipboard.delete(user.id)
        firstProfile.marry = member.toString()
        secondProfile.marry = message.member.toString()

        removeLoot(firstProfile, '💍')
        removeLoot(secondProfile, '💍')

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
  aliases: ['profile', 'birthday', 'about', 'marry', 'tear', 'rep'],
  cmdList: true,
}
