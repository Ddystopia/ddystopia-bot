module.exports = {
  addLoot(profile, loot) {
    if (profile.loot[loot]) profile.loot[loot]++
    else profile.loot[loot] = 1
  },
  removeLoot(profile, loot) {
    if (profile.loot[loot] < 2) delete profile.loot[loot]
    else profile.loot[loot]--
  },
}
