import React from "react"
import ReactDOM from "react-dom/client"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import App from "./App.jsx"
import "@fontsource-variable/grandstander"
import "./index.css"

const theme = extendTheme({
  fonts: {
    heading: `"Grandstander Variable", sans-serif`,
  },
  shadows: { outline: "0 0 0 2px var(--chakra-colors-pink-500)" },
  components: {
    Input: {
      defaultProps: {
        focusBorderColor: "pink.500",
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
