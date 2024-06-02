import { useEffect, useState } from "react"
import { create } from "zustand"
import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Heading,
  Input,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react"
import { socket } from "./socket"

const useStore = create((set) => ({
  player: null,
  game: null,
  setPlayer: (newPlayer) => set({ player: newPlayer }),
  setGame: (newGame) => set({ game: newGame }),
}))

function App() {
  const player = useStore((state) => state.player)
  const game = useStore((state) => state.game)
  const setPlayer = useStore((state) => state.setPlayer)
  const setGame = useStore((state) => state.setGame)

  const [playerList, setPlayerList] = useState([])

  useEffect(() => {
    function onPlayerCreated(player) {
      setPlayer(player)
    }

    function onGameFound(game) {
      setGame(game)
      console.log(game.id)
    }

    function onPlayerList(players) {
      setPlayerList(players)
      console.log(players)
    }

    function onUpdateGame(game) {
      setGame(game)
      console.log("update")
      console.log(game)
    }

    socket.on("player created", onPlayerCreated)
    socket.on("game found", onGameFound)
    socket.on("player list", onPlayerList)
    socket.on("update game", onUpdateGame)

    return () => {
      socket.off("player created", onPlayerCreated)
      socket.off("game found", onGameFound)
      socket.off("player list", onPlayerList)
      socket.off("update game", onUpdateGame)
    }
  })

  return (
    <Center minH="100vh">
      <Box>
        <Heading as="h1" size="4xl" textAlign="center" paddingBottom="2rem">
          TicTacToe
        </Heading>

        <Stat position="absolute" top="1rem" left="1rem">
          <StatNumber>{playerList.length}</StatNumber>
          <StatLabel>Users connected</StatLabel>
        </Stat>

        {!player ? (
          <PlayerForm />
        ) : !game ? (
          <Menu />
        ) : game.players.length === 1 ? (
          <Loading message="Waiting for another player to join..." />
        ) : (
          <Game />
        )}
      </Box>
    </Center>
  )
}

function PlayerForm() {
  const [username, setUsername] = useState("")

  function handleSubmit(event) {
    event.preventDefault()

    if (username.trim() === "") {
      setUsername("")
      return
    }

    socket.emit("create player", username)
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Input placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Button colorScheme="blue" type="submit">
            Continue
          </Button>
        </Stack>
      </form>
    </Container>
  )
}

function Menu() {
  const player = useStore((state) => state.player)

  function handlePlay() {
    socket.emit("find game")
  }

  return (
    <Container>
      <Stack>
        <Text fontSize="lg">Welcome, {player.username}!</Text>
        <Button colorScheme="blue" onClick={handlePlay}>
          Play
        </Button>
        <Button>Create private game</Button>
      </Stack>
    </Container>
  )
}

function getMark(value) {
  switch (value) {
    case 0:
      return "X"
    case 1:
      return "O"
    case null:
      return ""
    default:
      break
  }
}

function Game() {
  const player = useStore((state) => state.player)
  const game = useStore((state) => state.game)

  const myTurn = game.players[game.turn].id === player.id

  function play(index) {
    socket.emit("play", index)
  }

  return (
    <Container>
      <Box className="gameboard">
        {game.board.map((square, index) => (
          <button key={index} onClick={() => play(index)} disabled={square !== null || !myTurn}>
            {getMark(square)}
          </button>
        ))}
      </Box>

      <Card>
        <Text>{myTurn ? "It's your turn" : "Waiting for your turn"}</Text>
      </Card>
    </Container>
  )
}

function Loading({ message }) {
  return (
    <Container>
      <Spinner />
      <Text>{message}</Text>
    </Container>
  )
}

export default App
