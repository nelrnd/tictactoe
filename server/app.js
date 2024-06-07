require("dotenv").config()
const express = require("express")
const { createServer } = require("node:http")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require("uuid")

const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "http://localhost:5173" } })

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

  get clientPlayer() {
    return {
      id: this.id,
      username: this.username,
      score: this.score,
    }
  }

  updateScore(type) {
    this.score[type]++
    this.socket.emit("score update", this.score)
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

  get clientGame() {
    return {
      id: this.id,
      board: this.board,
      players: this.players.map((player) => player.clientPlayer),
      turn: this.turn,
    }
  }

  addPlayer(player) {
    if (this.players.length === 2 || this.players.find((p) => p.id === player.id)) {
      return // max nb of players reached
    }
    this.players.push(player)
    player.socket.join(this.id)
    if (this.players.length === 2) {
      this.start()
    }
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p.id !== player.id)
    this.end()
    player.socket.leave(this.id)
    this.io.to(this.id).emit("user left")
  }

  start() {
    this.io.to(this.id).emit("game start", this.clientGame)
  }

  play(index) {
    if (this.board[index] !== null) {
      return // square is already taken
    }

    this.board[index] = this.turn // 0 | 1

    this.switchTurn()

    this.updateClient()

    const win = this.checkIfWin()
    const draw = this.checkIfDraw()

    if (win || draw) {
      if (win) {
        this.io.to(this.id).emit("game win", win)
        this.updateScores(win)
      } else {
        this.io.to(this.id).emit("game draw", draw)
        this.updateScores({ type: "draws" })
      }
      setTimeout(() => {
        this.end()
        this.updateClient()
      }, 2000)
    }
  }

  switchTurn() {
    this.turn = Number(!this.turn)
  }

  updateScores(result) {
    this.players.forEach((player) => {
      const type = result.type === "draws" ? "draws" : result.playerId === player.id ? "wins" : "losses"
      player.updateScore(type)
    })
  }

  end() {
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
      if (winningPlayerId) {
        return false
      }
      return true
    })

    if (winningPlayerId && winningPattern) {
      return { playerId: winningPlayerId, pattern: winningPattern }
    }
  }

  checkIfDraw() {
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

  updateClient() {
    this.io.to(this.id).emit("game update", this.clientGame)
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
    addGame(game)
  }
  return game
}

io.on("connection", (socket) => {
  let player
  let game

  socket.on("new player", (username) => {
    player = new Player(username, socket)
    socket.emit("new player", player.clientPlayer)
  })

  socket.on("search game", () => {
    if (!game) {
      game = findGame()
      game.addPlayer(player)
    }
  })

  socket.on("play", (index) => {
    game.play(index)
  })

  socket.on("user left", () => {
    game.removePlayer(player)
    removeGame(player)
    game = null
  })

  socket.on("disconnect", () => {
    if (player && game) {
      game.removePlayer(player)
    }
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
