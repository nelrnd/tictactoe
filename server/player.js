class Player {
  constructor(username) {
    this.username = username
    this.score = { wins: 0, losses: 0, draws: 0 }
  }
}

export default Player
