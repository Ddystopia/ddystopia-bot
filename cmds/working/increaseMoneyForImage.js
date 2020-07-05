const User = require('../../classes/User')
const useUserGames = require('../../utils/useUserGames')
let COST = 30
const games = new Map()
const lastGames = new Map()

module.exports.run = async (client, message) => {
  const userGames = useUserGames(message.author.id, games, lastGames, 240)
  if (userGames > 40) return

  const attachmentsNum = message.attachments.size
  if (!attachmentsNum) return

  const user = await User.getOrCreateUser(message.author.id)
  if (user.bancrot) return

  user.coins += attachmentsNum * COST
  user.save()
}

module.exports.help = {
  name: 'increaseMoneyForImage',
}
