import { useEffect, useState } from "react"
import { socket } from "./socket"
import { create } from "zustand"

const useStore = create((set) => ({
  message: "",
  setMessage: (message) => set({ message }),
  wait: false,
  setWait: (wait) => set({ wait }),
}))

function App() {
  const [player, setPlayer] = useState(null)
  const [game, setGame] = useState(null)
  const setMessage = useStore((state) => state.setMessage)
  const setWait = useStore((state) => state.setWait)

  useEffect(() => {
    function onNewPlayer(player) {
      setPlayer(player)
    }

    function onGameStart(game) {
      setGame(game)
    }

    function onGameUpdate(game) {
      setGame(game)
      setWait(false)
    }

    function onUserLeft() {
      setGame(null)
      socket.emit("user left")
    }

    function onGameWin(result) {
      const message = result.playerId === player.id ? "You won" : "You lost"
      setMessage(message)
      setWait(true)
    }

    function onGameDraw() {
      setMessage("This is a draw")
      setWait(true)
    }

    function onScoreUpdate(score) {
      setPlayer({ ...player, score })
    }

    socket.on("new player", onNewPlayer)
    socket.on("game start", onGameStart)
    socket.on("game update", onGameUpdate)
    socket.on("user left", onUserLeft)
    socket.on("game win", onGameWin)
    socket.on("game draw", onGameDraw)
    socket.on("score update", onScoreUpdate)

    return () => {
      socket.off("new player", onNewPlayer)
      socket.off("game start", onGameStart)
      socket.off("game update", onGameUpdate)
      socket.off("user left", onUserLeft)
      socket.off("game win", onGameWin)
      socket.off("game draw", onGameDraw)
      socket.off("score update", onScoreUpdate)
    }
  }, [player, setMessage, setWait])

  if (!player) {
    return <PlayerForm />
  }

  if (!game) {
    return <GameLoading />
  }

  return <Game game={game} player={player} />
}

export default App

function PlayerForm() {
  const [username, setUsername] = useState("")

  function handleSubmit(event) {
    event.preventDefault()
    if (username) {
      socket.emit("new player", username)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button>Continue</button>
    </form>
  )
}

function GameLoading() {
  useEffect(() => {
    socket.emit("search game")
  }, [])

  return (
    <div>
      <p>Searching for a game</p>
      <p>Loading...</p>
    </div>
  )
}

function Game({ game, player }) {
  const setMessage = useStore((state) => state.setMessage)
  const myTurn = game.players[game.turn].id === player.id
  const otherPlayerUsername = game.players.find((p) => p.id !== player.id).username

  useEffect(() => {
    setMessage(myTurn ? "It's your turn" : "Wait for your turn")
  }, [game.board, setMessage, myTurn])

  return (
    <div>
      <h1>Playing against {otherPlayerUsername}</h1>
      <Message />
      <Board board={game.board} myTurn={myTurn} />
      <Score score={player.score} />
    </div>
  )
}

function Board({ board, myTurn }) {
  const wait = useStore((state) => state.wait)

  function play(index) {
    socket.emit("play", index)
  }

  return (
    <div className="gameboard">
      {board.map((square, id) => (
        <button key={id} onClick={() => play(id)} disabled={wait || !myTurn || typeof square === "number"}>
          {getMark(square)}
        </button>
      ))}
    </div>
  )
}

function getMark(value) {
  switch (value) {
    case 0:
      return "X"
    case 1:
      return "O"
    default:
      return ""
  }
}

function Message() {
  const message = useStore((state) => state.message)

  return <p>{message}</p>
}

function Score({ score }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Wins</th>
          <th>Looses</th>
          <th>Draws</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{score.wins}</td>
          <td>{score.losses}</td>
          <td>{score.draws}</td>
        </tr>
      </tbody>
    </table>
  )
}
