const { User } = require('../../models/User')
const { Loot } = require('../../models/Loot')
const { randomInteger } = require('../../utils/randomInteger')
const { formatDuration } = require('../../utils/formatDuration')
const { useUserGames } = require('../../utils/useUserGames')
const games = new Map()
const lastGames = new Map()

const SECONDS_COOLDOWN = 16 * 60 * 60
const MAX_DAILY_LOOT_COST = 5000

module.exports.run = async (message, args, command) => {
  const allLoot = await Loot.find({ guildId: message.guild.id })
  switch (command) {
    case 'loot': {
      const user = await User.getOrCreate(message.author.id, message.guild.id)
      if (Date.now() - user.timers.loot < 1000 * SECONDS_COOLDOWN)
        return message.reply(
          `Вы уже получили свою долю, следующий раз получить можно через ${formatDuration(
            SECONDS_COOLDOWN - (Date.now() - user.timers.loot) / 1000
          )}`
        )
      const winnedLoot = calcLoot(allLoot, MAX_DAILY_LOOT_COST)
      user.addLoot([winnedLoot])

      user.timers.loot = Date.now()
      user.save()
      message.reply(
        `Вы получили ${winnedLoot}, следующий раз получить можно через 24 часа`
      )
      break
    }

    case 'giveloot': {
      const userTillMention = message.mentions.users.first()
      if (!userTillMention) return

      const userFrom = await User.getOrCreate(message.author.id, message.guild.id)
      const userTill = await User.getOrCreate(userTillMention.id, message.guild.id)
      let lootArray = []
      if (args[1] === 'all')
        for (const ownLoot of userFrom.loot)
          for (let i = 0; i < ownLoot.number; i++) lootArray.push(ownLoot.loot)
      else lootArray = userFrom.getLootArray(args.slice(1).join(''), allLoot)

      if (lootArray.length < 1) return message.reply('Не продаётся')

      userFrom.removeLoot(lootArray)
      userTill.addLoot(lootArray)

      message.react('✅')
      userFrom.save()
      userTill.save()
      break
    }
    case 'lootbox': {
      const user = await User.getOrCreate(message.author.id, message.guild.id)
      if (!user.findOwnLoot(':gift:'))
        return message.reply('Нечего открывать ¯\\_(ツ)_/¯')
      user.removeLoot([':gift:'])
      const userGames = useUserGames(message.author.id, games, lastGames, 30)
      let percent = randomInteger(0, 100)
      if (userGames > 20) percent -= ((userGames / 1.5) % 30) + 10

      const maxLootCost = Math.max(...allLoot.map(r => r.cost))
      let maxCost = 0
      if (percent === 100) maxCost = maxLootCost
      else if (percent > 97) maxCost = .7 * maxLootCost
      else if (percent > 93) maxCost = .2 * maxLootCost
      else if (percent > 70) maxCost = 2e4
      else maxCost = MAX_DAILY_LOOT_COST

      const winnedLoot = calcLoot(allLoot, maxCost)
      user.addLoot([winnedLoot])
      user.save()
      message.reply(`Вы получили ${winnedLoot}`)
    }
  }
}

function calcLoot(loot, maxCost = MAX_DAILY_LOOT_COST) {
  const loots = loot.filter(line => line.cost <= maxCost).map(item => item.loot)
  const winnedLoot = loots[randomInteger(0, loots.length - 1)]
  return winnedLoot
}

module.exports.help = {
  name: 'loot',
  aliases: ['giveloot', 'lootbox'],
}
