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

class Player {
  constructor(username, socket) {
    this.id = uuidv4()
    this.username = username
    this.socket = socket
    this.score = { wins: 0, losses: 0, draws: 0 }
  }

  updateScore(type) {
    this.score[type]++
    this.socket.emit("new score", this.score)
  }
}

class Game {
  constructor(io) {
    this.id = uuidv4()
    this.io = io
    this.board = new Array(9).fill(null)
    this.players = []
    this.startTurn = 0
    this.turn = 0
  }

  addPlayer(player) {
    if (this.players.length === 2) {
      return // max nb of players reached
    }
    this.players.push(player)
    player.socket.join(this.id)
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p.id !== player.id)
    player.socket.leave(this.id)
  }

  play(index) {
    if (this.board[index] !== null) {
      return // square is already taken
    }

    this.board[index] = this.turn // 0 | 1

    const win = this.checkIfWin()
    if (win) {
      this.io.to(this.id).emit("win", win)
      this.updateScores(win)
      return this.endGame()
    }

    const full = this.checkIfFull()
    if (full) {
      this.io.to(this.id).emit("full", full)
      this.updateScores({ type: "full" })
      return this.endGame()
    }

    this.switchTurn()
  }

  switchTurn() {
    this.turn = Number(!this.turn)
  }

  updateScores(result) {
    this.players.forEach((player) => {
      if (result.type === "win") {
        player.updateScore(result.playerId === player.id ? "wins" : "losses")
      } else if (result.type === "full") {
        player.updateScore("draws")
      }
    })
  }

  endGame() {
    this.board = new Array(9).fill(null)
    this.startTurn = Number(!this.startTurn)
    this.turn = this.startTurn
  }

  checkIfWin() {
    let winningPlayerId = null
    let winningPattern = null

    this.players.every((player, playerIndex) => {
      winningPatterns.every((pattern) => {
        let win = true
        pattern
          .split("")
          .map((square) => Number(square))
          .forEach((square, id) => {
            if (square === 1 && this.board[id] !== playerIndex) {
              win = false
            }
          })
        if (win) {
          winningPlayerId = player.id
          winningPattern = this.convertPattern(pattern)
          return false
        }
        return true
      })
    })

    if (winningPlayerId && winningPattern) {
      return { player: winningPlayerId, pattern: winningPattern }
    }
  }

  checkIfFull() {
    return this.board.every((square) => square !== null)
  }

  // convert pattern for front end anim
  convertPattern(pattern) {
    return pattern
      .split("")
      .map((square) => Number(square))
      .map((square, id) => (square ? id : null))
      .filter((square) => square !== null)
  }
}

let games = []

function addGame(game) {
  games.push(game)
}

function removeGame(game) {
  games = games.filter((g) => g.id !== game.id)
}

function findGame() {
  let game = games.find((game) => game.players.length === 1)
  if (!game) {
    game = new Game(io)
    games.push(game)
  }
  return game
}

io.on("connection", (socket) => {
  let player
  let game

  socket.on("new player", (username) => {
    player = new Player(username, socket)
    socket.emit("new player", player)
  })

  socket.on("find game", () => {
    game = findGame()
    game.addPlayer(player)
  })

  socket.on("play", (index) => {
    game.play(index)
  })

  socket.on("disconnect", () => {
    if (player && game) {
      game.removePlayer(player)
    }
  })
})
