const { MessageEmbed } = require('discord.js')
const { readdir } = require('fs')
const slider = require('../../utils/slider')
const rainbow = require('../../utils/rainbow')
const readWrite = require('../../utils/readWriteFile')
const bankProfiles = readWrite.file('bank_profiles.json')
const MAX_ROWS = 10

module.exports.run = async (client, message, args) => {
  const lb = []
  const profiles = []
  const loot = readWrite.file('loot.json')
  readdir(__dirname.replace(/cmds.+$/, '') + `profiles/`, (err, files) => {
    if (err) throw new Error(err)
    const jsonFiles = files.filter(f => f.split('.').pop() === 'json')
    if (jsonFiles.length <= 0) throw new Error('No files to download')
    jsonFiles.forEach(f => {
      const id = f.replace('.json', '')
      profiles.push([id, readWrite.profile(id)])
    })

    profiles
      .sort((a, b) => +b[1].coins - +a[1].coins)
      .forEach(item => {
        const [id, profile] = item
        let actives = profile.coins
        if (bankProfiles[id] && bankProfiles[id].deposit)
          actives += bankProfiles[id].deposit.sum
        if (bankProfiles[id] && bankProfiles[id].credit)
          actives -= bankProfiles[id].credit.sum
        actives += Object.entries(profile.loot).reduce(
          (sum, lootArray) => sum + loot[lootArray[0]],
          0
        )
        lb.push([id, Math.floor(actives)])
      })
    const embeds = []
    for (let page = 0; page < Math.floor(lb.length / 10); page++) {
      const embed = new MessageEmbed()
        .setColor(rainbow())
        .setTitle('Leader board')
        .setThumbnail(
          'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
        )
        .setTimestamp()
      const lbChunk = lb.slice(page * MAX_ROWS, (page + 1) * MAX_ROWS)
      let i = 0
      for (let item of lbChunk) {
        const member = message.guild.members.cache.get(item[0])
        if (!member) continue
        const username = member.nickname || member.user.username
        embed.addField(++i, `${username} - ${item[1]}${currency}`)
      }
      embeds.push(embed)
    }
    slider(embeds, message, args[0])
  })
}
module.exports.help = {
  name: 'lb',
}
