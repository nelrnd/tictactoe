import { useEffect, useState } from "react"
import { create } from "zustand"
import { Box, Button, Center, Container, Heading, Input, Stack } from "@chakra-ui/react"
import { socket } from "./socket"

const useStore = create((set) => ({
  player: null,
  game: null,
  setPlayer: (newPlayer) => set({ player: newPlayer }),
  setGame: (newGame) => set({ game: newGame }),
}))

function App() {
  const player = useStore((state) => state.player)
  const setPlayer = useStore((state) => state.setPlayer)

  useEffect(() => {
    function onPlayerCreated(player) {
      setPlayer(player)
    }

    socket.on("player created", onPlayerCreated)

    return () => {
      socket.off("player created", onPlayerCreated)
    }
  })

  return (
    <Center minH="100vh">
      <Box>
        <Heading as="h1" size="4xl" textAlign="center" paddingBottom="2rem">
          TicTacToe
        </Heading>

        {!player ? <PlayerForm /> : <Menu />}
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

    socket.connect()
    socket.emit("create player", username)
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Input placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Button type="submit">Continue</Button>
        </Stack>
      </form>
    </Container>
  )
}

function Menu() {
  return (
    <Container>
      <Stack>
        <Button>Play</Button>
        <Button>Create private game</Button>
      </Stack>
    </Container>
  )
}

export default App
