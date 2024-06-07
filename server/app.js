require("dotenv").config()
const express = require("express")
const { createServer } = require("node:http")
const { Server } = require("socket.io")
const Game = require("./game")
const Player = require("./player")

const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "http://localhost:5173" } })

let players = []
let games = []

io.on("connection", (socket) => {
  let player
  let game

  emitPlayerList()

  socket.on("create player", (username) => {
    player = new Player(username)
    players.push(player)
    socket.emit("player created", player)
    emitPlayerList()
  })

  socket.on("find game", () => {
    game = games.find((game) => game.isPrivate === false && game.players.length === 1)
    if (!game) {
      game = new Game()
      games.push(game)
    }
    game.addPlayer(player)
    socket.join(game.id)
    emitGame()
  })

  socket.on("play", (index) => {
    if (game.players[game.turn].id !== player.id) {
      return // not your turn
    }

    const result = game.play(index)

    emitGame()

    if (result) {
      if (result.type === "win") {
        io.to(game.id).emit("win", result)
        setTimeout(() => {
          game.reset()
          emitGame()
        }, 2000)
      }
      if (result.type === "draw") {
        io.to(game.id).emit("draw")
        setTimeout(() => {
          game.reset()
          emitGame()
        }, 2000)
      }
    } else {
    }
  })

  socket.on("disconnect", () => {
    if (player) {
      players = players.filter((p) => p !== player)
      emitPlayerList()
    }
    if (game) {
      if (game.players.length === 1) {
        games = games.filter((g) => g.id !== game.id)
      }
    }
  })

  function emitGame() {
    io.to(game.id).emit("update game", game)
  }

  function emitPlayerList() {
    io.emit("player list", players)
  }
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
