require("dotenv").config()
const express = require("express")
const { createServer } = require("node:http")
const { Server } = require("socket.io")
const Game = require("./game")
const Player = require("./player")

const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "http://localhost:5173" } })

const players = []
const games = []

app.get("/", (req, res) => res.send("Hello World!"))

io.on("connection", (socket) => {
  console.log("a user connected")

  socket.on("create player", (username) => {
    const player = new Player(username)

    socket.emit("player created", player)
  })

  socket.on("find game", () => {
    console.log("finding a game")

    let game = games.find((game) => game.private === false && game.players.length === 1)

    if (!game) {
      game = new Game()
      games.push(game)
    }

    socket.emit("game found", { game })
  })

  socket.on("disconnect", () => {
    console.log("a user disconnected")
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
