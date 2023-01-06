// https://github.com/Program-AR/pilas-bloques/blob/develop/mirage/fixtures/desafios.js

const stringify = (list) => list.map(id => id.toString())

export const firstCycleIds = 
  stringify([201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255])

export const tecnopolisIncompleteIds = 
  stringify([202101, 202102, 2021001, 2021002, 2021003, 2021004, 2021005, 2021006, 2021007, 2021008]) // tecnopolis (more missing)

export const secondCycleIds = stringify([
  1, 46, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, // Repetition
  13, 14, 15, 38, 39, 40, 41, 16, 17, 18, 43, 44, 45, 42, // Conditional Alternative
  19, 20, 21, 22, 23, 24, 25, // Conditional Repetition
  26, 27, // Numeric sensors
  28, // Parameterization: Nano
  29, 30, 31, 32, 33, 34, 35, 36, 37, // Parameterization: Draw
  130, 131, 132, 133, 134, 135, 136 // Parameterization: rest
])

export const allChallengeIds = secondCycleIds.concat(firstCycleIds).concat(tecnopolisIncompleteIds)


export const decompositionChallengesIds = 
  secondCycleIds.filter( id => !["1", "3", "13", "14", "15", "26", "136"].includes(id))