module.exports = async (embeds, message) => {
  const msg = await message.reply(embeds[0].setDescription(`1 / ${embeds.length}`))
  await msg.react('⬅')
  await msg.react('✖')
  await msg.react('➡')

  let i = 0
  const filter = (reaction, user) => {
    return ['⬅', '✖', '➡'].includes(reaction.emoji.name) && user.id === message.author.id
  }
  const step = reaction => {
    let embed
    if (reaction.emoji.name === '✖') msg.delete({ time: 0 }).catch(() => {})
    else if (reaction.emoji.name === '⬅') embed = i > 0 ? embeds[--i] : null
    else if (reaction.emoji.name === '➡')
      embed = i < embeds.length - 1 ? embeds[++i] : null

    if (!embed) return
    msg.edit(embed.setDescription(`${i + 1} / ${embeds.length}`))
  }

  const collector = msg.createReactionCollector(filter)
  collector.on('collect', step)
  collector.on('end', () => {
    msg.delete({ time: 0 }).catch(() => {})
  })
}
