const { onDelete } = require('../utils/onDeleteId')

module.exports.getCallback = () => async channel => {
  onDelete(channel)
}

module.exports.event = 'channelDelete'
