const { MessageEmbed } = require('discord.js')
const { User } = require('../../models/User')
const { Loot } = require('../../models/Loot')
const { BankMember } = require('../../models/BankMember')
const { slider } = require('../../utils/slider')
const { rainbow } = require('../../utils/rainbow')
const MAX_ROWS = 10 // 25 is max because discord provide only 25 field for one embed

module.exports.run = async (message, [page], command) => {
  let lb = []
  const loot = await Loot.find({ guildId: message.guild.id })
  const users = await User.find({ guildId: message.guild.id })
  // wait for lb become full
  await new Promise(resolve => {
    users.forEach(async (user, i) => {
      let actives
      if (command === 'forbs') {
        const bankMember = await BankMember.getOrCreate(user.id, message.guild.id)
        actives = user.coins
        if (bankMember.deposit) actives += bankMember.deposit.sum
        if (bankMember.credit) actives -= bankMember.credit.sum
        actives += Object.entries(user.loot).reduce((sum, lootArray) => {
          const usersLoot = loot.find(loot => loot.loot === lootArray[0]) || { cost: 0 }
          return sum + usersLoot.cost
        }, 0)
      } else actives = user.level

      const member = message.guild.member(user.id)
      if (!member || member.user.bot) return
      lb.push([member, Math.floor(actives)])
      if (users.length - 1 === i) resolve()
    })
  })

  lb = lb.filter(a => !isNaN(+a[1])).sort((a, b) => b[1] - a[1])
  const embeds = []
  for (let page = 0, i = 0; page < Math.floor(lb.length / 10); page++) {
    const embed = new MessageEmbed()
      .setColor(rainbow())
      .setTitle('Leader board')
      .setThumbnail(message.author.avatarURL())
      .setTimestamp()
    const lbChunk = lb.slice(page * MAX_ROWS, (page + 1) * MAX_ROWS)
    for (let item of lbChunk) {
      const [member, actives] = item
      embed.addField(
        ++i,
        `${member.displayName} - ${actives}${
          command === 'forbs' ? global.currency : ' level'
        }`
      )
    }
    embeds.push(embed)
  }
  slider(embeds, message, page).catch(console.error)
}
module.exports.help = {
  name: 'lb',
  aliases: ['forbs'],
}
