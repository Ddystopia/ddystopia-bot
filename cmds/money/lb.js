const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const MAX_ROWS = 10

module.exports.run = async (client, message, args) => {
  const lb = []
  const profiles = []
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Leader board')
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
    )
    .setTimestamp()
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

    let page = +args[0]
    if (page < 2 || isNaN(page)) page = 1
    if (page * 10 > lb.length) page = Math.floor(lb.length / 10)

    embed.setDescription(`Page number ${page - 1}`)
    const lbChunk = lb.slice((page - 1) * MAX_ROWS, page * MAX_ROWS)
    let i = 0
    for (let item of lbChunk) {
      const member = message.guild.members.cache.get(item[0])
      if (!member) continue
      const username = member.nickname || member.user.username
      embed.addField(++i, `${username} - ${item[1]}${currency}`)
    }

    message.reply(embed)
  })
}
module.exports.help = {
  name: 'lb',
}
