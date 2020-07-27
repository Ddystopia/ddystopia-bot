const { User } = require('../../models/User')
const { useUserGames } = require('../../utils/useUserGames')
const COST_FOR_IMAGE = 30
const MINS_COOLDOWN = 240
const games = new Map()
const lastGames = new Map()

module.exports.run = async message => {
  const userGames = useUserGames(message.author.id, games, lastGames, MINS_COOLDOWN)
  if (userGames > 40) return

  const attachmentsNum = message.attachments.size
  if (!attachmentsNum) return

  const user = await User.getOrCreate(message.author.id, message.guild.id)

  user.coins += attachmentsNum * COST_FOR_IMAGE
  user.save()
}

module.exports.help = {
  name: 'increaseMoneyForImage',
}
