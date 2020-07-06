const { MessageEmbed } = require('discord.js')
const rainbow = require('../../utils/rainbow.js')
const games = new Map()
class TicTacToe {
  constructor(firstPlayer, secondPlayer) {
    this.firstPlayer = firstPlayer
    this.secondPlayer = secondPlayer
    this.squares = Array(9).fill(null)
    this.xIsNext = true
  }
  step(square, player) {
    if (player !== (this.xIsNext ? this.secondPlayer : this.firstPlayer)) return null
    if (this.squares[square - 1]) return null

    this.squares[square - 1] = this.xIsNext ? '❌' : '⭕'
    this.xIsNext = !this.xIsNext
    let winner = null
    if (this.calculateWinner(this.squares) === '❌') winner = this.firstPlayer
    else if (this.calculateWinner(this.squares) === '⭕') winner = this.secondPlayer

    return {
      nextStep: this.xIsNext ? this.firstPlayer : this.secondPlayer,
      nextSymbol: this.xIsNext ? '❌' : '⭕',
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
  message.react('▶')
  const reactionFilter = (res, user) => res.emoji.name === '▶' && !user.bot

  const startCollector = message.createReactionCollector(reactionFilter, {
    time: 30000,
    errors: ['time'],
  })
  startCollector.on('collect', collected => {
    const firstPlayer = message.author.id
    const secondPlayer = [...collected.users.cache].find(user => !user[1].bot)[0]
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
    message.channel.send(embed)
    startCollector.stop()
  })

  const stepCollector = message.channel.createMessageCollector(
    m => !m.author.bot && /^[1-9]$/.test(m.content),
    { idle: 30000 }
  )
  stepCollector.on('collect', m => {
    const game = games.get(m.author.id)
    if (!game) return
    const response = game.step(m.content, m.author.id)
    if (!response) return

    const embed = createEmbed(response, m)
    m.channel.send(embed)

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
