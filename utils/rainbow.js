const COLOR_SIZE = 60
const COLOR_STEP = 4
const rainbow = new Array(COLOR_SIZE)

for (let i = 0, sinI = 0; i < COLOR_SIZE; i++, sinI += COLOR_STEP) {
  const red = sin_to_hex(sinI, (0 * Math.PI * 2) / 3) // 0 deg
  const blue = sin_to_hex(sinI, (1 * Math.PI * 2) / 3) // 120 deg
  const green = sin_to_hex(sinI, (2 * Math.PI * 2) / 3) // 240 deg

  rainbow[i] = '#' + red + green + blue
}

module.exports = (() => {
  let counter = 0
  return () => {
    const color = rainbow[counter]
    counter = (counter + 1) % COLOR_SIZE
    return color
  }
})()

function sin_to_hex(i, phase) {
  const sin = Math.sin((Math.PI / COLOR_SIZE) * 2 * i + phase)
  const int = Math.floor(sin * 127) + 128
  const hex = int.toString(16)

  return hex.length === 1 ? '0' + hex : hex
}
