const { onlyEmoji } = require('emoji-aware')
const emoji = require('emoji-dictionary')
module.exports.getConvertedEmojiArray = (string, loot) => {
  let res = []
  const firstPart = string.match(/<:.+?:\d{15,}?>|:.+?:/g)
  const secondPart = onlyEmoji(string).map(e => `:${emoji.getName(e)}:`)
  if (firstPart) res = firstPart.concat(secondPart)
  else res = secondPart
  return res.filter(item => !loot || loot.some(el => el.loot === item))
}
