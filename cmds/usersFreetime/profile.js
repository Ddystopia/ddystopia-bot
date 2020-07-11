const { MessageEmbed } = require('discord.js')
const { User } = require('../../classes/User')
const { Leveling } = require('../../classes/Leveling.js')
const { rainbow } = require('../../utils/rainbow.js')
const sqlite3 = require('sqlite3').verbose()
const marryClipboard = new Map()
const repClipboard = new Map()

module.exports.run = async (message, args, command) => {
  const loot = await new Promise(resolve => {
    const db = new sqlite3.Database('./data.db')
    db.all('SELECT * FROM loot', (err, rows) =>
      resolve(rows.reduce((loot, row) => ({ ...loot, [row.loot]: row.cost }), {}))
    )
    db.close()
  })
  const id =
    (message.mentions.users.first() && message.mentions.users.first().id) ||
    message.author.id
  const member = await message.guild.members.fetch(id)
  const profile = await User.getOrCreateUser(id)
  switch (command) {
    case 'profile':
    case 'юзер':
    case 'профиль':
      {
        const usersLoot = Object.entries(profile.loot)
          .sort((a, b) => loot[b[0]] - loot[a[0]])
          .map(line => `${line[0]} ${line[1]}`)
          .join(' | ')

        const embed = new MessageEmbed()
          .setColor(rainbow())
          .setTitle('Profile')
          .setAuthor(
            member.displayName,
            member.user.avatarURL(),
            'https://discord.js.org'
          )
          .setThumbnail(member.user.avatarURL())
          .addField('🎩 Actives', Math.floor(profile.coins) + currency, true)
          .addField('👑 Level', profile.level, true)
          .addField('⚔ xp', `${profile.xp} / ${Leveling.calcXp(profile.level)}`, true)
          .addField('😎 Reputation', profile.rep, true)
          .addField('🎉 Birthday', profile.birthday || 'Не указан', true)
          .addField('💖 Married with', profile.marry || 'Не в браке', true)
          .addField('🛍 Loot', usersLoot || 'Не имеет лута')
          .addField('📜 about', profile.about || 'Не указан')
          .setTimestamp()
        message.reply(embed)
      }
      break

    case 'birthday': {
      if (member.user.id !== message.author.id) return
      if (!args[0]) return
      const birthday = args[0].split(/[-/|.]/).join('-')
      if (!/\d{4}-(0\d|1[012])-[0-3]\d/.test(birthday))
        return message.reply('invalid date')
      profile.birthday = birthday
      profile.save()
      message.react('✅')
      break
    }

    case 'about': {
      const ownProfile = await User.getOrCreateUser(message.author.id)
      ownProfile.about = args.slice(0, 100).join(' ').replace(/\\n/g, '\n')
      ownProfile.save()
      message.react('✅')
      break
    }

    case 'rep': {
      if (member.user.id === message.author.id) return
      const time = repClipboard.get(`${message.author.id}->${member.user.id}`)
      if (Date.now() - time < 1000 * 60 * 10) return message.react('❌')

      repClipboard.set(`${message.author.id}->${member.user.id}`, Date.now())
      profile.rep++
      message.react('✅')
      profile.save()
      break
    }

    case 'marry': {
      if (member.user.id === message.author.id) return
      const firstProfile = await User.getOrCreateUser(message.author.id)
      const secondProfile = profile

      if (!!firstProfile.marry || !!secondProfile.marry)
        return message.reply('Кто-то из вас двоих уже в отношениях')
      if (!firstProfile.loot['💍'] || !secondProfile.loot['💍'])
        return message.reply('У кого-то из вас нет кольца')

      if (marryClipboard.get(member.user.id) === message.author.id) {
        marryClipboard.delete(member.user.id)
        firstProfile.marry = member.toString()
        secondProfile.marry = message.member.toString()

        firstProfile.removeLoot(['💍'])
        secondProfile.removeLoot(['💍'])

        firstProfile.save()
        secondProfile.save()
        message.react('✅')
      } else {
        const firstUserId = message.author.id
        marryClipboard.set(firstUserId, member.user.id)
        message.react('⏳')
      }
      break
    }

    case 'tear': {
      if (member.user.id !== message.author.id || !profile.marry) return
      const firstProfile = profile
      const secondProfile = await User.getOrCreateUser(
        profile.marry.match(/(\d{15,})/)[1]
      )
      profile.marry = null
      secondProfile.marry = null

      firstProfile.save()
      secondProfile.save()
      message.react('✅')
      break
    }
  }
}

module.exports.help = {
  name: 'profile',
  aliases: ['юзер', 'профиль', 'birthday', 'about', 'marry', 'tear', 'rep'],
}
