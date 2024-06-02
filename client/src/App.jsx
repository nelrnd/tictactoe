import { Box, Button, Center, Container, Heading, Input, Stack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { socket } from "./socket"

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState("")
  const [stage, setStage] = useState(0)

  function handleContinue(event) {
    event.preventDefault()

    if (username.trim() === "") {
      setUsername("")
      return
    }

    setStage((stage) => ++stage)
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])

  return (
    <Center h="100vh">
      <Box>
        <Heading as="h1" size="4xl" textAlign="center" paddingBottom="2rem">
          TicTacToe
        </Heading>

        <p>{isConnected ? "online" : "disconnected"}</p>

        <Container>
          {stage === 0 && (
            <form onSubmit={handleContinue}>
              <Stack>
                <Input
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Button type="submit">Continue</Button>
              </Stack>
            </form>
          )}
          {stage === 1 && (
            <Stack>
              <Button>Play</Button>
              <Button>Create private room</Button>
            </Stack>
          )}
        </Container>
      </Box>
    </Center>
  )
}

export default App
