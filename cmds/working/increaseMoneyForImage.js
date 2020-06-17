const useUserGames = require('../../utils/useUserGames')
const readWrite = require('../../utils/readWriteFile')
let cost = 100
const games = new Map()
const lastGames = new Map()

module.exports.run = async (client, message) => {
  const userGames = useUserGames(message.author.id, games, lastGames)
  if (userGames > 40) return

  const attachmentsNum = message.attachments.size
  if (!attachmentsNum) return

  const profile = readWrite.profile(message.author.id)
	if(profile.bancrot) return

  profile.coins += attachmentsNum * cost
  readWrite.profile(message.author.id, profile)
}

module.exports.help = {
  name: 'increaseMoneyForImage',
}
