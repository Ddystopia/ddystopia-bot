const { RoleForShop } = require('../models/RoleForShop')
const { RoleForLeveling } = require('../models/RoleForLeveling')
const { onDelete } = require('../utils/onDeleteId')

module.exports.getCallback = () => async role => {
	if (role.position < role.guild.me.roles.highest.position) return 
	await RoleForShop.deleteMany({ id: role.id })
	await RoleForLeveling.deleteMany({ id: role.id })
	onDelete(role)
}
module.exports.event = 'roleUpdate'
