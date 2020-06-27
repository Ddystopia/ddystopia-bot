const { MessageEmbed } = require('discord.js')
const User = require('../../classes/User')
const { readdir } = require('fs')
const path = require('path')
const slider = require('../../utils/slider')
const rainbow = require('../../utils/rainbow')
const readWrite = require('../../utils/readWriteFile')
const MAX_ROWS = 10

module.exports.run = async (client, message, args, command) => {
  let lb = []
  const profiles = []
  const loot = readWrite('loot.json')
  readdir(path.join(__dirname, '..', '..', 'profiles'), (err, files) => {
    if (err) throw new Error(err)
    const jsonFiles = files.filter(f => f.split('.').pop() === 'json')
    if (jsonFiles.length <= 0) throw new Error('No files to download')
    jsonFiles.forEach(f => {
      const id = f.replace('.json', '')
      profiles.push([id, User.getOrCreateUser(id)])
    })

    profiles.forEach(async item => {
      const [id, profile] = item
      let actives
      if (command === 'forbs') {
        const bankProfiles = readWrite('bank_profiles.json')
        actives = profile.coins
        if (bankProfiles[id] && bankProfiles[id].deposit)
          actives += bankProfiles[id].deposit.sum
        if (bankProfiles[id] && bankProfiles[id].credit)
          actives -= bankProfiles[id].credit.sum
        actives += Object.entries(profile.loot).reduce(
          (sum, lootArray) => sum + loot[lootArray[0]],
          0
        )
      } else actives = profile.level
      const member =
        message.guild.members.cache.get(id) ||
        (await message.guild.members.fetch(id).catch(() => {}))
      if (!member || member.user.bot) return
      lb.push([member, Math.floor(actives)])
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
    slider(embeds, message, args[0])
  })
}
module.exports.help = {
  aliases: ['lb', 'forbs'],
  cmdList: true,
}
