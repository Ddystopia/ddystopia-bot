const { MessageEmbed } = require('discord.js')
const User = require('../../classes/User.js')
const rainbow = require('../../utils/rainbow.js')
const randomInteger = require('../../utils/randomInteger.js')
const games = new Map()
class TicTacToe {
  constructor(firstPlayer, secondPlayer, bet) {
    this.firstPlayer = firstPlayer
    this.secondPlayer = secondPlayer
    this.bet = bet
    this.squares = Array(9).fill(null)
    this.xIsNext = true
    this.winner = null
    this._timeout = null
  }
  step(square, player) {
    if (player !== (this.xIsNext ? this.secondPlayer : this.firstPlayer)) return
    if (this.squares[square - 1]) return

    this.squares[square - 1] = this.xIsNext ? '❌' : '⭕'
    if (this.calculateWinner(this.squares) === '❌') this.winner = this.secondPlayer
    else if (this.calculateWinner(this.squares) === '⭕') this.winner = this.firstPlayer
    this.xIsNext = !this.xIsNext
    return this.getResponseForMessage()
  }
  async stop(stepCollector) {
    stepCollector.stop()
    clearTimeout(this._timeout)
    const players = [
      await User.getOrCreateUser(this.firstPlayer),
      await User.getOrCreateUser(this.secondPlayer),
    ]
    players.forEach(({ id }) => games.delete(id))

    if (players[0].id !== players[1].id && this.winner) {
      players.sort(player => (player.id === this.winner ? -1 : 0))
      players[0].coins += this.bet
      players[1].coins -= this.bet
      players.forEach(player => player.save())
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
  reloadTimeout(callback) {
    clearTimeout(this._timeout)
    this._timeout = setTimeout(callback, 30000)
  }
  createCallBackToStopGame(stepCollector, channel, members) {
    return () => {
      this.winner = this.xIsNext ? this.firstPlayer : this.secondPlayer
      this.stop(stepCollector)
      channel.send(
        this.createEmbed(
          {
            ...this.getResponseForMessage(),
            nextSymbol: this.xIsNext ? '⭕' : '❌',
          },
          members
        )
      )
    }
  }
  getResponseForMessage() {
    return {
      nextStep: this.xIsNext ? this.secondPlayer : this.firstPlayer,
      nextSymbol: this.calculateWinner(this.squares) || this.xIsNext ? '❌' : '⭕',
      squares: this.squares,
      firstPlayer: this.firstPlayer,
      secondPlayer: this.secondPlayer,
      winner: this.winner,
    }
  }
  createEmbed(response, members) {
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
          const draw = response.squares.find(s => !s) === undefined
          const word = response.winner ? 'Победитель' : draw ? 'Ничья' : 'Ход'
          const name = members.cache.get(response.winner || response.nextStep).displayName
          const player = `${name}, ${response.nextSymbol}`

          return `${word} ${draw && !this.winner ? '' : player}`
        })()
      )
  }
}

module.exports.run = async (client, message, args) => {
  if (games.has(message.author.id)) return // return if already in game
  message.react('▶')
  const tillPlay = message.mentions.users.first()
  const reactionFilter = (res, user) =>
    res.emoji.name === '▶' && !user.bot && (!tillPlay || tillPlay.id === user.id)

  // Collector to start game
  const startCollector = message.createReactionCollector(reactionFilter, {
    time: 30000,
    errors: ['time'],
  })
  // Collector to do step
  const stepCollector = message.channel.createMessageCollector(
    m => !m.author.bot && /^[1-9]$/.test(m.content)
  )

  startCollector.on('collect', async collected => {
    const [firstPlayer, secondPlayer] = [
      await User.getOrCreateUser(message.author.id),
      await User.getOrCreateUser(
        [...collected.users.cache].find(
          user => !user[1].bot && (!tillPlay || tillPlay.id === user[1].id)
        )[0]
      ),
    ].sort(() => randomInteger(-2, 1) || 1) //random sort
    if (games.has(firstPlayer.id) || games.has(secondPlayer.id)) return

    const bet = +args[0] || +args[1] || 0
    if (firstPlayer.coins < bet || secondPlayer.coins < bet)
      return message.reply('У кого-то из вас не хватает')

    const game = new TicTacToe(firstPlayer.id, secondPlayer.id, bet)

    games.set(firstPlayer.id, game)
    games.set(secondPlayer.id, game)

    game.reloadTimeout(
      game.createCallBackToStopGame(stepCollector, message.channel, message.guild.members)
    )

    const embed = game.createEmbed(game.getResponseForMessage(), message.guild.members)
    startCollector.stop(['game is started'])
    message.channel.send(embed)
  })

  stepCollector.on('collect', async m => {
    const { channel, author, content, guild } = m
    const game = games.get(author.id)
    if (!game) return
    const response = game.step(content, author.id)
    if (!response) return

    const embed = game.createEmbed(game.getResponseForMessage(), message.guild.members)
    channel.send(embed)

    game.reloadTimeout(
      game.createCallBackToStopGame(stepCollector, channel, guild.members)
    )

    m.delete({ time: 0 })

    if (response.winner || response.squares.find(square => !square) === undefined)
      game.stop(stepCollector)
  })

  stepCollector.on('end', () => message.channel.send('Игра окончена'))
  startCollector.on(
    'end',
    (err, reason) => reason[0] !== 'game is started' && message.reply('Время вышло')
  )
}

module.exports.help = {
  name: 'ttt',
}
