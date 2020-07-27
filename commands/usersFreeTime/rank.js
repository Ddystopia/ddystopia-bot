const { MessageAttachment } = require('discord.js')
const Canvas = require('canvas')
const { User } = require('../../models/User')
const { Leveling } = require('../../classes/Leveling')

module.exports.run = async message => {
  message.channel.startTyping()
  const member = message.mentions.members.first() || message.member
  const user = await User.getOrCreate(member.id, message.guild.id)
  const progress = user.xp / Leveling.calcXp(user.level)

  const canvas = Canvas.createCanvas(800, 250)
  const ctx = canvas.getContext('2d')

  const background = await Canvas.loadImage(
    'https://i.ibb.co/NpYHgk6/1580410612-24-p-foni-perekhodami-tsvetov-61.jpg'
  )
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  // Add an exclamation point here and below
  ctx.font = '36px sans-sherif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(member.displayName, 250, 71)

  pasteText(
    [
      [24, 'ур.'],
      [46, user.level.toString()],
      [24, 'опыт'],
      [46, `${user.xp}/${Leveling.calcXp(user.level)}`],
    ],
    [280, 140],
    ctx
  )

  ctx.beginPath()
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true)
  ctx.rect(280 - 2, 160 - 2, 500 + 4, 50 + 4)
  ctx.closePath()
  ctx.clip()

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }))
  ctx.drawImage(avatar, 25, 25, 200, 200)

  //container
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(305, 185)
  ctx.arc(305, 185, 25, Math.PI / 2, Math.PI * 1.5)
  ctx.moveTo(755, 185)
  ctx.arc(755, 185, 25, Math.PI / 2, Math.PI * 1.5, true)
  ctx.moveTo(305, 160)
  ctx.lineTo(755, 160)
  ctx.lineTo(755, 210)
  ctx.lineTo(305, 210)
  ctx.lineTo(305, 160)
  ctx.closePath()
  ctx.fill()

  //progressBar
  const startDot = 303
  const width = startDot + 450 * progress
  ctx.fillStyle = '#e6a5d9'
  ctx.beginPath()
  ctx.moveTo(startDot, 185)
  ctx.arc(startDot, 185, 25, Math.PI / 2, Math.PI * 1.5)
  ctx.moveTo(width, 185)
  ctx.arc(width, 185, 25, Math.PI / 2, Math.PI * 1.5, true)
  ctx.moveTo(startDot, 160)
  ctx.lineTo(width, 160)
  ctx.lineTo(width, 210)
  ctx.lineTo(startDot, 210)
  ctx.lineTo(startDot, 160)
  ctx.closePath()
  ctx.fill()

  const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome-image.png')

  message.channel.send(attachment)
  message.channel.stopTyping()
}

module.exports.help = {
  name: 'rank',
  aliases: ['ранг'],
}

const pasteText = (textArray, dot, ctx) => {
  let currentLeft = dot[0]
  textArray.forEach(item => {
    const [size, text] = item
    ctx.font = `${size}px sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(text, currentLeft, dot[1])
    currentLeft += size * text.length * 0.7
  })
}
