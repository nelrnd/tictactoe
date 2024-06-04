import { useEffect, useLayoutEffect, useState } from "react"
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
    <>
      <Stat position="absolute" top="1rem" left="1rem">
        <StatNumber>{playerList.length}</StatNumber>
        <StatLabel>Users connected</StatLabel>
      </Stat>

      {<Test />}

      {/*!game ? <Home /> : <Game />*/}
    </>
  )
}

function Home() {
  const player = useStore((state) => state.player)

  return (
    <Center minH="100vh">
      <Container>
        <Heading as="h1" fontSize="6xl" textAlign="center" paddingBottom="2rem">
          TicTacToe
        </Heading>

        {!player ? <PlayerForm /> : <Menu />}
      </Container>
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
          <Input
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            color="black"
            backgroundColor="white"
            size="lg"
            required
          />
          <Button colorScheme="pink" size="lg" type="submit">
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
        <Text fontSize="xl" paddingBottom="1rem">
          Welcome, {player.username}!
        </Text>
        <Button colorScheme="pink" size="lg" onClick={handlePlay}>
          Play
        </Button>
        <Button colorScheme="purple" size="lg">
          Create private game
        </Button>
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

  return (
    <Container minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Center flex="1">
        {game.players.length === 1 ? (
          <Loading message="Waiting for another player to join..." />
        ) : (
          <>
            <Board />
            <Message>{myTurn ? "It's your turn" : "Waiting for your turn"}</Message>
          </>
        )}
      </Center>
    </Container>
  )
}

function Board() {
  const player = useStore((state) => state.player)
  const game = useStore((state) => state.game)
  const myTurn = game.players[game.turn].id === player.id

  function play(index) {
    socket.emit("play", index)
  }

  return (
    <Box className="gameboard">
      {game.board.map((square, index) => (
        <button key={index} onClick={() => play(index)} disabled={square !== null || !myTurn}>
          {getMark(square)}
        </button>
      ))}
      <svg width="858" height="858" viewBox="0 0 858 858" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M568 846L568 12" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
        <path d="M290 846L290 12" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
        <path d="M12 568L846 568" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
        <path d="M12 290L846 290" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
      </svg>
    </Box>
  )
}

function Loading({ message }) {
  return (
    <Stack spacing={4} align="center">
      <Spinner size="xl" speed="0.65s" thickness="4px" color="pink.500" emptyColor="gray.200" />
      {message && (
        <Text fontSize="xl" textAlign="center">
          {message}
        </Text>
      )}
    </Stack>
  )
}

function Header() {
  return (
    <Box as="header" padding="1rem">
      <Heading as="h1" size="md" textAlign="center">
        TicTacToe
      </Heading>
    </Box>
  )
}

function Message({ children }) {
  return (
    <Card padding="2rem" border="solid 1px" borderColor="gray.200" position="absolute" bottom="1rem">
      <Text fontSize="4xl">{children}</Text>
    </Card>
  )
}

function Test() {
  const game = {
    id: 123,
    board: [0, null, null, 1, 0, null, null, 1, 0],
    players: [],
    turn: 1,
    isPrivate: false,
  }

  function play(index) {
    socket.emit("play", index)
  }

  useLayoutEffect(() => {
    const winningSquares = [0, 4, 8]
    animateBlink(winningSquares)
  }, [])

  function animateBlink(indexArr) {
    const buttons = document.querySelectorAll(".gameboard button")
    buttons.forEach((button, index) => {
      if (indexArr.includes(index)) {
        button.classList.add("blink")
        button.addEventListener("animationend", () => button.classList.remove("blink"), false)
      }
    })
  }

  return (
    <Container minH="100vh" display="flex" flexDirection="column">
      <Center flex="1">
        <Box className="gameboard">
          {game.board.map((square, index) => (
            <button key={index} onClick={() => play(index)}>
              {getMark(square)}
            </button>
          ))}
          <svg width="858" height="858" viewBox="0 0 858 858" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M568 846L568 12" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
            <path d="M290 846L290 12" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
            <path d="M12 568L846 568" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
            <path d="M12 290L846 290" stroke="#B0B0B0" strokeWidth="24" strokeLinecap="round" />
          </svg>
        </Box>
      </Center>
    </Container>
  )
}

export default App
