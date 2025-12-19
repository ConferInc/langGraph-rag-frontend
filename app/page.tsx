"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import ChatWindow from "@/components/ChatWindow"
import "@/styles/app.css"
import axios from "axios"

interface Message {
  role: string
  content: string
}

export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000"

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Moxi, your friendly AI assistant. How can I help you today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState([{ id: 1, title: "Getting Started" }])
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get(`${backendUrl}/health`, { timeout: 5000 })
        if (response.data.status === "healthy") {
          setBackendConnected(true)
        }
      } catch (error) {
        console.warn("Backend health check failed:", error)
        setBackendConnected(false)
      }
    }
    checkBackend()
  }, [backendUrl])

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage = { role: "user", content: message }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      console.log("Sending request to:", `${backendUrl}/chat`)

      const response = await axios.post(
        `${backendUrl}/chat`,
        { question: message },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 second timeout
        }
      )

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer || "I received an empty response.",
      }

      setMessages((prev) => [...prev, assistantMessage])
      setBackendConnected(true) // Mark as connected on success
    } catch (error: any) {
      console.error("Error sending message:", error)
      
      let errorMessage = "Sorry, there was an error. Please try again."
      
      if (error.code === "ERR_BLOCKED_BY_CLIENT" || error.message?.includes("blocked")) {
        errorMessage = "Request was blocked. Please check your browser extensions (ad blockers) or firewall settings. The backend should be running on http://127.0.0.1:5000"
        setBackendConnected(false)
      } else if (error.response) {
        // Server responded with error status
        errorMessage = `Server error: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`
        console.error("Response error:", error.response.data)
        setBackendConnected(true) // Server is reachable
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Unable to connect to the server. Please make sure the backend is running on http://127.0.0.1:5000. Run 'python app.py' in the Backend directory."
        console.error("Request error:", error.request)
        setBackendConnected(false)
      } else if (error.code === "ECONNREFUSED") {
        errorMessage = "Connection refused. Please ensure the backend server is running on http://127.0.0.1:5000"
        setBackendConnected(false)
      } else {
        // Something else happened
        errorMessage = `Error: ${error.message || "Unknown error"}`
      }
      
      const errorMsg = { role: "assistant", content: errorMessage }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm Moxi, your friendly AI assistant. How can I help you today?",
      },
    ])
  }

  return (
    <div className="app-container">
      <Sidebar conversations={conversations} onNewChat={handleNewChat} />
      <ChatWindow 
        messages={messages} 
        isLoading={isLoading} 
        onSendMessage={handleSendMessage}
        backendConnected={backendConnected}
        backendUrl={backendUrl}
      />
    </div>
  )
}
