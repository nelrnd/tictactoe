const { v4: uuidv4 } = require("uuid")

const winningPatterns = [
  "111000000",
  "000111000",
  "000000111",
  "100100100",
  "010010010",
  "001001001",
  "100010001",
  "001010100",
]

class Game {
  constructor(isPrivate = false) {
    this.id = uuidv4()
    this.board = new Array(9).fill(null)
    this.players = []
    this.turn = 0
    this.lastGameTurn = 0
    this.isPrivate = isPrivate
  }

  addPlayer(player) {
    if (this.players.length === 2) {
      return // max nb of players reached
    }

    this.players.push(player)
  }

  play(index) {
    if (this.board[index] !== null) {
      return // square is already taken
    }

    this.board[index] = this.turn

    this.switchTurn()

    const win = this.checkIfWin()
    if (win) {
      return { type: "win", ...win }
    }

    const full = this.checkIfFull()
    if (full) {
      return { type: "draw" }
    }
  }

  switchTurn() {
    this.turn = Number(!this.turn)
  }

  checkIfWin() {
    const players = [0, 1]
    let winningPlayer = null
    let winningPattern = null

    players.every((player) => {
      return winningPatterns.every((pattern) => {
        let patternWin = true
        pattern
          .split("")
          .map((square) => Number(square))
          .forEach((square, index) => {
            if (square === 1 && this.board[index] !== player) {
              patternWin = false
            }
          })
        if (patternWin) {
          winningPlayer = this.players[player]
          winningPattern = pattern
            .split("")
            .map((square, index) => (square !== "0" ? index : square))
            .filter((square) => square !== "0")
          return false
        }
        return true
      })
    })

    if (winningPlayer && winningPattern) {
      return { winningPlayer, winningPattern }
    }
  }

  checkIfFull() {
    return this.board.every((square) => square !== null)
  }

  reset() {
    this.board = new Array(9).fill(null)
    this.turn = Number(!this.lastGameTurn)
    this.lastGameTurn = Number(!this.lastGameTurn)
  }
}

module.exports = Game
