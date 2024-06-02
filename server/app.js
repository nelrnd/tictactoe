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

app.get("/", (req, res) => res.send("Hello World!"))

io.on("connection", (socket) => {
  console.log("a user connected")

  io.emit("player list", players)

  socket.on("create player", (username) => {
    const player = new Player(username)
    socket.player = player
    players.push(player)
    socket.emit("player created", player)
    io.emit("player list", players)
  })

  socket.on("find game", () => {
    let game = games.find((game) => game.isPrivate === false && game.players.length === 1)
    if (!game) {
      game = new Game()
      games.push(game)
    }
    socket.emit("game found", game)
  })

  socket.on("disconnect", () => {
    if (socket.player) {
      players = players.filter((player) => player !== socket.player)
      io.emit("player list", players)
    }
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
