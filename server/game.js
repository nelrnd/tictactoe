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
    this.board = new Array(9).fill(null)
    this.players = []
    this.turn = 0
    this.isPrivate = isPrivate
  }

  addPlayer(player) {
    if (this.player.length === 2) {
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

    const win = checkIfWin()
    if (win !== null) {
      console.log(win + " has won")
    }

    const full = checkIfFull()
    if (full) {
      console.log("This is a draw")
    }
  }

  switchTurn() {
    this.turn = Number(!this.turn)
  }

  checkIfWin() {
    const players = [0, 1]
    let win = null

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
          win = player
          return false
        }
        return true
      })
    })

    return win
  }

  checkIfFull() {
    return this.board.every((square) => square !== null)
  }

  reset() {
    this.board = new Array(9).fill(null)
    this.turn = 0
  }
}

module.exports = Game
