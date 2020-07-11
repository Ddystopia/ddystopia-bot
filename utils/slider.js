module.exports.slider = async (embeds, message, start) => {
  if (embeds.length < 1) throw new ReferenceError('Cannot find any embed')
  let i = +start > 0 ? +start - 1 : 0
  if (i > embeds.length - 1) i = embeds.length - 1

  const msg = await message.reply(embeds[i].setDescription(`${i + 1} / ${embeds.length}`))
  await msg.react('⬅')
  await msg.react('✖')
  await msg.react('➡')

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

  const collector = msg.createReactionCollector(filter, { dispose: true })
  collector.on('collect', step)
  collector.on('remove', step)
  collector.on('end', () => {
    msg.delete({ time: 0 }).catch(() => {})
  })
}
