const { v4: uuidv4 } = require("uuid")

class Player {
  constructor(username) {
    this.id = uuidv4()
    this.username = username
    this.score = { wins: 0, losses: 0, draws: 0 }
  }
}

module.exports = Player
