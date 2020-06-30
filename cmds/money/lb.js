const { MessageEmbed } = require('discord.js')
const User = require('../../classes/User')
const { BankMember } = require('../../classes/BankMember')
const slider = require('../../utils/slider')
const rainbow = require('../../utils/rainbow')
const sqlite3 = require('sqlite3').verbose()
const MAX_ROWS = 10

module.exports.run = async (client, message, args, command) => {
  let lb = []
  const db = new sqlite3.Database('./data.db')

  const loot = await new Promise(resolve =>
    db.all('SELECT * FROM loot', (err, rows) => resolve(rows))
  )
  const ids = await new Promise(resolve =>
    db.all('SELECT id FROM users', (err, rows) => resolve(rows.map(el => el.id)))
  )
  db.close()
  await new Promise(resolve => {
    ids
      .map(async id => User.getOrCreateUser(id))
      .forEach(async (user, i) => {
        user = await user
        let actives
        if (command === 'forbs') {
          const bankMember = await BankMember.getOrCreateBankMember(user.id)
          actives = user.coins
          if (bankMember.deposit) actives += bankMember.deposit.sum
          if (bankMember.credit) actives -= bankMember.credit.sum
          actives += Object.entries(user.loot).reduce((sum, lootArray) => {
            const usersLoot = loot.find(loot => loot.loot === lootArray[0]) || { cost: 0 }
            return sum + usersLoot.cost
          }, 0)
        } else actives = user.level
        const member =
          message.guild.members.cache.get(user.id) ||
          (await message.guild.members.fetch(user.id).catch(() => {}))
        if (!member || member.user.bot) return
        lb.push([member, Math.floor(actives)])
        if (ids.length - 1 === i) resolve()
      })
  })

  lb = lb.filter(a => !isNaN(+a[1])).sort((a, b) => b[1] - a[1])
  const embeds = []
  for (let page = 0, i = 0; page < Math.floor(lb.length / 10); page++) {
    const embed = new MessageEmbed()
      .setColor(rainbow())
      .setTitle('Leader board')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTimestamp()
    const lbChunk = lb.slice(page * MAX_ROWS, (page + 1) * MAX_ROWS)
    for (let item of lbChunk) {
      const [member, actives] = item
      embed.addField(
        ++i,
        `${member.displayName} - ${actives}${command === 'forbs' ? currency : ' level'}`
      )
    }
    embeds.push(embed)
  }
  slider(embeds, message, args[0]).catch(console.error)
}
module.exports.help = {
  aliases: ['lb', 'forbs'],
  cmdList: true,
}
