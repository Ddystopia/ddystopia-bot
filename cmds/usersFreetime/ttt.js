const { MessageEmbed } = require('discord.js')
const rainbow = require('../../utils/rainbow.js')
const randomInteger = require('../../utils/randomInteger.js')
const games = new Map()
class TicTacToe {
  constructor(firstPlayer, secondPlayer) {
    this.firstPlayer = firstPlayer
    this.secondPlayer = secondPlayer
    this.squares = Array(9).fill(null)
    this.xIsNext = true
    this.message = null
  }
  step(square, player) {
    if (player !== (this.xIsNext ? this.secondPlayer : this.firstPlayer)) return null
    if (this.squares[square - 1]) return null

    this.squares[square - 1] = this.xIsNext ? '❌' : '⭕'
    let winner = null
    if (this.calculateWinner(this.squares) === '❌') winner = this.secondPlayer
    else if (this.calculateWinner(this.squares) === '⭕') winner = this.firstPlayer
    this.xIsNext = !this.xIsNext

    return {
      nextStep: this.xIsNext ? this.secondPlayer : this.firstPlayer,
      nextSymbol: this.calculateWinner(this.squares) || this.xIsNext ? '❌' : '⭕',
      squares: this.squares,
      firstPlayer: this.firstPlayer,
      secondPlayer: this.secondPlayer,
      winner,
    }
  }
  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (const line of lines) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return squares[a]
    }
    return null
  }
}

module.exports.run = async (client, message) => {
  if (games.has(message.author.id)) return // return if already in game
  message.react('▶')
  const tillPlay = message.mentions.users.first()
  const reactionFilter = (res, user) =>
    res.emoji.name === '▶' && !user.bot && (!tillPlay || tillPlay.id === user.id)

  const startCollector = message.createReactionCollector(reactionFilter, {
    time: 30000,
    errors: ['time'],
  })
  startCollector.on('collect', async collected => {
    const [firstPlayer, secondPlayer] = [
      message.author.id,
      [...collected.users.cache].find(
        user => !user[1].bot && (!tillPlay || tillPlay.id === user[1].id)
      )[0],
    ].sort(() => randomInteger(-2, 1) || 1) //random sort
    const game = new TicTacToe(firstPlayer, secondPlayer)

    games.set(firstPlayer, game)
    games.set(secondPlayer, game)
    const embed = createEmbed(
      {
        nextStep: game.xIsNext ? game.secondPlayer : game.firstPlayer,
        nextSymbol: game.xIsNext ? '❌' : '⭕',
        squares: game.squares,
        firstPlayer: game.firstPlayer,
        secondPlayer: game.secondPlayer,
        winner: game.winner,
      },
      message
    )
    startCollector.stop()
    game.message = await message.channel.send(embed)
  })

  const stepCollector = message.channel.createMessageCollector(
    m => !m.author.bot && /^[1-9]$/.test(m.content),
    { idle: 30000 }
  )
  stepCollector.on('collect', m => {
    const game = games.get(m.author.id)
    if (!game) return
    m.delete({ time: 0 })
    const response = game.step(m.content, m.author.id)
    if (!response) return

    const embed = createEmbed(response, m)
    game.message.edit(embed)

    if (response.winner || response.squares.find(square => !square) === undefined) {
      games.delete(response.firstPlayer)
      games.delete(response.secondPlayer)
      stepCollector.stop()
    }
  })
  stepCollector.on('end', () => message.channel.send('Игра окончена'))
}

const createEmbed = (response, m) => {
  const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
  return new MessageEmbed()
    .setColor(rainbow())
    .addField(
      '\u200B',
      response.squares
        .map((symbol, i) => {
          const str = symbol || numbers[i]
          return (i + 1) % 3 === 0 ? str + '\n' : str + ' | '
        })
        .join('')
    )
    .setTitle(
      (() => {
        const name = m.guild.members.cache.get(response.winner || response.nextStep)
          .displayName
        return `${response.winner ? 'Победитель' : 'Ход'} ${name}, ${response.nextSymbol}`
      })()
    )
}
module.exports.help = {
  name: 'ttt',
}
