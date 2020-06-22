const { MessageEmbed } = require('discord.js')
const rainbow = require('../../utils/rainbow')
class EmbedInstance extends MessageEmbed {
  constructor(title) {
    super()
    this.setColor(rainbow())
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/402109825896415232/692820764478668850/yummylogo.jpg'
      )
      .setTitle(title)
  }
}

module.exports.run = async (client, message, args) => {
  const embedIntroduction = new EmbedInstance('Введение')
    .addField(
      '\u200B',
      `Бот ещё пишется, и в будущем комманд будет больше.\nЕсли увидите баг, соообщите модерации и не пользуйтесь им.\nЕсли что-то не ясно, спросите у пользователей онлайн, и поменьше трогайте модерацию(они злые)`
    )
    .setFooter('Реакции нажимать чтоб листать')

  const embedProfile = new EmbedInstance('Команды профиля').addField(
    '\u200B',
    `
		Если вы имеете лут 🎟, то вы можете обратится к администратору, и в замен он саздаст роль специально для вас!!!
	1. >profile [@упоминание] - показать профиль, если не будет аргумента, или он будет некоректен, покажет ваш
	2. >birthday [DD-MM-YYYY] - установить день рождения
	3. >about [text] - рассказать о себе, чтоб пеевести строку, используйте \\n
	4. >marry [@упоминание] - пожениться с пользователем, вы оба должны иметь лут💍, если пользователь напишет такую же комнду с пингом на вас, в профиле отобразит вашу половинку 
	5. >tear - порвать брак
	6. >loot  - собрать случайный лут
	7. >giveLoot [@упоминание] [лут[|лут]+] - дать кому-то лут
	8. >lootBox - открыть лутбокс, который вы должны предварительно купить (🎁)
	9. >ship [@упоминание]{2,} - шипперство, от 2х и более пингов
	Пример: >ship @Right @Left
	`
  )

  const embedCasino = new EmbedInstance('Команды казино').addField(
    '\u200B',
    `
1. >daily - раз в 12 часов, 2% шанс получить не 1к а 10к
2. >br [sum / all]
3. >wheel [sum / all]
4. >cf [sum / all] [t / h]
5. >money [@упоминание] - узнать баланс (если вы допустите ошибку в аргументах или не укажите их, покажет ваши значения)
6. >give [sum] [@упоминание] - Больше 10к нельзя(если вы будете передавать много раз, то на 50к вам дадут пред, на 60к мут)
7. >lb [page] - таблица лидеров

За активность в #🎪┃мемы  и #🔞┃nsfw  вам будут капать деньги
		`
  )

  const embedBank = new EmbedInstance('Команды банка #🏧┃банк').addField(
    '\u200B',
    `
1. >bank create deposit [sum] [days] - создать депозит(чтобы расчитать выгодный процент, рекомендую посмотреть на график)
Пример: >bank create deposit 10000 10
2. >bank create credit [sum] [days] - создать кредит(чтобы расчитать выгодный процент, рекомендую посмотреть на график)
(Не больше 100000, не меньше 1000, не больше 4 дней; если сумма меньше 50000, то не больше 2 дня; сумма кредита должна быть не более чем в 15 раз выше уже имеющейся)
Пример: >bank create credit 100000 4
Пример: >bank create credit 100000 -4(дадада, даже на отрицательно время брать можно. не баг а фича)
3. >bank repay credit [sum] - сделать выплату кредита
(Не раньше чем через 3 часа после выдачи кредита)
Пример: >bank create credit 90000 4
4. >bank repay deposit [sum] - доложить на депозит
5. >bank info - посмотреть свою информацию по кредиту / депозиту
		`
  )

  const embedPercents = new EmbedInstance('Как считаются проценты:').addField(
    '\u200B',
    `
График на Кредит:
Х это сумма кредита делёная на 10 000, Y это процент, берётся самое высокое значение Y:
http://yotx.ru/#!1/3_h/ubW/ugfSOG8L@2f7R/sH@w7yel1vY3NzbWwKe763ubZ2e7@wf7JBp2A8Z43DplPO6cne3ub@1vbuxtbu2Cz6A7Z/sH@yQadgN0wHjcAW0xHkEHu/tb@1tn@wf7JBp2YwuGYDweMB4Pdve39gEH
\`\`\`js
Math.max(-((Math.E * 6) ** (sum / 1e+4) - 55), -((sum / 1e+4) - 1) * 5 + 25, 15)\`\`\`

График на Депозит:
Х это количество дней а делёное на 10, Y это процент, берётся самое низкое значение Y, и результат делится на 2.35:
http://yotx.ru/#!1/3_h/ubW/ugfSOG8L@2f7R/sH@w7yel1vY31tZPd9f3ti/2D/ZJNOwGjPG4dcp43Dk7293f2t/Y29zaBZ9CzqBbZ/sH@yQadgN0wHjcAW0xHkEHu/tb@zsH@wf7JBp2YwuGYDweMB4Pdve39gEH
\`\`\`js
(Math.E ** 6) ** (days / 10) / 3, ((days / 10) - 1) * 6.5 + 15, 20) / 2.35\`\`\`

===============================
Если есть возможность, предлогайте свои графики, а то это 2.35 просто затычка
		`
  )

  const embedShop = new EmbedInstance('Команды магазина ролей').addField(
    '\u200B',
    `
1. >shop - посмотреть таблицу
2. >shop buy [number on table] - купить роль
3. >shop sell [number on table] - продать роль`
  )

  const embedShop2 = new EmbedInstance('Команды магазина вещей').addField(
    '\u200B',
    `
1. >market - посмотреть таблицу
2. >market buy [лут[|лут]+] - купить лут
3. >market sell [лут[|лут]+] - продать лут
Пример: >market buy 🎁
Пример: >market buy 🎁|🎟
`
  )

  const embedHentai = new EmbedInstance('Хентай команды').addField(
    '\u200B',
    `
>hentai [genre] [n] - аргументы не обязательны
1 >= n <= 15
Доступные жанры(их писать вместо [genre], максимум 1 жанр за вызов)
 | randomHentaiGif | pussy | nekoGif | neko | lesbian |
 | kuni | cumsluts | classic | boobs | bJ |
 | anal | yuri | yaoi | trap | tits | eroKitsune |
 | girlSoloGif | girlSolo | pussyWankGif | pussyArt | kemonomimi |
 | kitsune | keta | holo | holoEro | hentai |
 | futanari | femdom | feetGif | eroFeet | feet |
 | ero | avatar | eroKemonomimi| eroNeko  |eroYuri |
 | cumArts | blowJob | spank | gasm |
Есть ещё жанры, но они не стоят упоминания сдесь
	`
  )

  const embedActions = new EmbedInstance('Команды действий').addField(
    '\u200B',
    `
>[command] [@упоминание] - аргументы не обязательны

Доступные действия(их писать вместо [conmmand])
 | smug | baka | tickle | slap | poke | 
 | pat | neko | nekoGif | meow | lizard | 
 | kiss | hug | foxGirl | feed | cuddle | 
 | kemonomimi | holo | woof | wallpaper |  
 | gecg | avatar | waifu | why | goose |
 | catText | OwOify | 8Ball | spoiler |
 | fact | 
	`
  )

  const embedModeration = new EmbedInstance('Модерации').addField(
    '\u200B',
    `
1. >bank remove [credit/deposit/bancrot] [@упоминание] - удалить кредит / депозит / банкрот
2. >reward [sum / -all(снять всё)] [@упоминание]
3. >setRoleEveryone [ИМЯ роли] [basic / -] [delIfAnother] - без флага basic даст всем онлайн пользователям роль, с флагом basic и без delIfAnother даст только тем, у кого ролей нет, с delIfAnother ещё и удалит у тех, у кого есть роли
4. >shop add [@упоминание роли] [sum] - Добавить роль в таблицу / Изменить цену роли
5. >shop remove [@упоминание роли] - Удалить роль из таблицы
6. >market add [лут] [sum] - Добавить лут в таблицу / Изменить цену роли
7. >market remove [лут] - Удалить лут из таблицы
8. >embed [#упоминание канала] [JSON] - для генерации json-а используйте https://eb.nadeko.bot/ , сами не пишите
9. >cities clear - очистить массив слов
10. >cities addtWords [JSON] - добавить массив слов
11. >cities setWords [JSON] - добавить массив слов
		`
  )
  // prettier-ignore
  const embeds = [embedIntroduction, embedProfile, embedCasino, embedBank, embedPercents, embedShop, embedShop2, embedActions, embedHentai, embedModeration]
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

  const collector = msg.createReactionCollector(filter, { time: 60000 })
  collector.on('collect', step)
  collector.on('end', () => {
    msg.delete({ time: 0 }).catch(() => {})
  })
}

module.exports.help = {
  name: 'help',
}
