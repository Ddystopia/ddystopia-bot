const { RoleForShop } = require('../models/RoleForShop')
const { RoleForLeveling } = require('../models/RoleForLeveling')
const { onDelete } = require('../utils/onDeleteId')

module.exports.getCallback = () => async role => {
  await RoleForShop.deleteMany({ id: role.id })
  await RoleForLeveling.deleteMany({ id: role.id })
  onDelete(role)
}

module.exports.event = 'roleDelete'
