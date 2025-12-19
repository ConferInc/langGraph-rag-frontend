"use client"

import { useRef, useEffect } from "react"
import MessageBubble from "./MessageBubble"
import InputBox from "./InputBox"
import "../styles/chat-window.css"

export default function ChatWindow({ messages, isLoading, onSendMessage, backendConnected, backendUrl }) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <div className="chat-window">
      <header className="chat-header">
        <h1>Moxi Assistant</h1>
        {backendConnected === false && (
          <div style={{ 
            fontSize: "12px", 
            color: "#ff6b6b", 
            marginTop: "4px",
            padding: "4px 8px",
            backgroundColor: "#ffe0e0",
            borderRadius: "4px",
            display: "inline-block"
          }}>
            ⚠️ Backend not connected. Ensure server is running at {backendUrl}
          </div>
        )}
        {backendConnected === true && (
          <div style={{ 
            fontSize: "12px", 
            color: "#51cf66", 
            marginTop: "4px",
            padding: "4px 8px",
            backgroundColor: "#e0ffe0",
            borderRadius: "4px",
            display: "inline-block"
          }}>
            ✓ Backend connected
          </div>
        )}
      </header>

      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageBubble key={index} role={message.role} content={message.content} />
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <InputBox onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  )
}
