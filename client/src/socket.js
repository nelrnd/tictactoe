import { io } from "socket.io-client"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

//const URL = import.meta.env.MODE === "production" ? SERVER_BASE_URL : "http://localhost:3000"

export const socket = io(SERVER_BASE_URL)
