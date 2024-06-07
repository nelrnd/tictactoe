import { useEffect, useState } from "react"
import { socket } from "./socket"
import { create } from "zustand"
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"

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
    function displayTurn(game) {
      if (game) {
        const myTurn = game.players[game.turn].id === player.id
        const message = myTurn ? "It's your turn" : "Waiting for your turn"
        setMessage(message)
      }
    }

    function onNewPlayer(player) {
      setPlayer(player)
    }

    function onGameStart(game) {
      setGame(game)
      displayTurn(game)
    }

    function onGameUpdate(game) {
      setGame(game)
      setWait(false)
      displayTurn(game)
    }

    function onUserLeft() {
      setGame(null)
      socket.emit("user left")
    }

    function onGameWin(result) {
      const message = result.playerId === player.id ? "You won" : "You lost"
      console.log(message)
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
  }, [player, setMessage, setWait, game])

  if (!player) {
    return <PlayerForm />
  }

  return (
    <Flex minHeight="100vh" flexDirection="column">
      <Box as="header" padding="2rem">
        <Heading size="md" textAlign="center">
          TicTacToe
        </Heading>
      </Box>
      <Center flex="1" padding="1rem">
        {game ? <Game game={game} player={player} /> : <GameLoading />}
      </Center>
    </Flex>
  )
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
    <Center minHeight="100vh">
      <Container>
        <Heading textAlign="center" marginBottom="2rem">
          TicTacToe
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack>
            <Input placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button type="submit" colorScheme="pink">
              Continue
            </Button>
          </Stack>
        </form>
      </Container>
    </Center>
  )
}

function GameLoading() {
  useEffect(() => {
    socket.emit("search game")
  }, [])

  return (
    <Stack align="center" spacing={4}>
      <Spinner size="xl" speed="0.65s" thickness="4px" color="pink.500" emptyColor="gray.200" />
      <Text fontSize="xl" textAlign="center">
        Searching for a game...
      </Text>
    </Stack>
  )
}

function Game({ game, player }) {
  const myTurn = game.players[game.turn].id === player.id
  const otherPlayerUsername = game.players.find((p) => p.id !== player.id).username

  return (
    <Stack maxWidth="100%" align="center" spacing={10}>
      <Heading>Playing against {otherPlayerUsername}</Heading>
      <Message />
      <Board board={game.board} myTurn={myTurn} />
      <Score score={player.score} />
    </Stack>
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
      <svg width="858" height="858" viewBox="0 0 858 858" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M568 846L568 12" stroke="#E2E8F0" strokeWidth="24" strokeLinecap="round" />
        <path d="M290 846L290 12" stroke="#E2E8F0" strokeWidth="24" strokeLinecap="round" />
        <path d="M12 568L846 568" stroke="#E2E8F0" strokeWidth="24" strokeLinecap="round" />
        <path d="M12 290L846 290" stroke="#E2E8F0" strokeWidth="24" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function getMark(value) {
  switch (value) {
    case 0:
      return (
        <svg width="134" height="133" viewBox="0 0 134 133" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="-5.47852"
            y="15.2347"
            width="30"
            height="175"
            rx="15"
            transform="rotate(-45 -5.47852 15.2347)"
            fill="#3182CE"
          />
          <rect
            x="118.265"
            y="-5.97839"
            width="30"
            height="175"
            rx="15"
            transform="rotate(45 118.265 -5.97839)"
            fill="#3182CE"
          />
        </svg>
      )

    case 1:
      return (
        <svg width="131" height="131" viewBox="0 0 131 131" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="65.5" cy="65.5" r="51.5" stroke="#D53F8C" strokeWidth="28" />
        </svg>
      )

    default:
      return null
  }
}

function Message() {
  const message = useStore((state) => state.message)

  if (!message) return null

  return (
    <Card width="24rem" maxWidth="100%" margin="auto">
      <CardBody>
        <Text fontSize="xl" textAlign="center">
          {message}
        </Text>
      </CardBody>
    </Card>
  )
}

function Score({ score }) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Wins</Th>
          <Th>Looses</Th>
          <Th>Draws</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>{score.wins}</Td>
          <Td>{score.losses}</Td>
          <Td>{score.draws}</Td>
        </Tr>
      </Tbody>
    </Table>
  )
}
