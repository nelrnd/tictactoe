import { Box, Button, Center, Container, Heading, Input, Stack } from "@chakra-ui/react"
import { useState } from "react"

function App() {
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

  return (
    <Center h="100vh">
      <Box>
        <Heading as="h1" size="4xl" textAlign="center" paddingBottom="2rem">
          TicTacToe
        </Heading>

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
                <Button>Continue</Button>
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
