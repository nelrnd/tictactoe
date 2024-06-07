import { io } from "socket.io-client"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

const URL = import.meta.env.NODE_ENV === "production" ? SERVER_BASE_URL : "http://localhost:3000"

export const socket = io(URL)
