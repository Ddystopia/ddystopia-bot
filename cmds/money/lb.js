const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const slider = require('../../utils/slider')
const MAX_ROWS = 10

module.exports.run = async (client, message, args) => {
  const lb = []
  const profiles = []
  fs.readdir(__dirname.replace(/cmds.+$/, '') + `profiles/`, (err, files) => {
    if (err) throw new Error(err)
    const jsonFiles = files.filter(f => f.split('.').pop() === 'json')
    if (jsonFiles.length <= 0) throw new Error('No files to download')
    jsonFiles.forEach(f => {
      profiles.push([f.replace('.json', ''), require(`../../profiles/${f}`)])
    })

    profiles
      .sort((a, b) => +b[1].coins - +a[1].coins)
      .forEach(item => lb.push([item[0], item[1].coins]))
    const embeds = []
    for (let page = 0; page < Math.floor(lb.length / 10); page++) {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
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
    slider(embeds, message)
  })
}
module.exports.help = {
  name: 'lb',
}
