import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Download, Bot, User, Loader, Trash2 } from 'lucide-react'
import { chatbotApi } from '../api/client'

const WELCOME = {
  role: 'assistant',
  content: "Hello! I'm your AI Visa Assistant. I can help you with visa requirements, required documents, travel procedures, embassy information, and more. What would you like to know?",
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-navy-700'}`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await chatbotApi.sendMessage(text, sessionId)
      setSessionId(res.data.session_id)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again in a moment.',
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    setMessages([WELCOME])
    setSessionId(null)
  }

  const downloadHistory = () => {
    const text = messages
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visa-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const suggestions = [
    'Do I need a visa for Japan?',
    'What documents do I need for a Schengen visa?',
    'How long can I stay in the US without a visa?',
    'How do I apply for a tourist visa?',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={32} /> AI Visa Assistant
          </h1>
          <p className="text-gray-500 mt-2">
            Ask any question about visa requirements, documents, or travel procedures.
          </p>
        </div>

        <div className="card p-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {/* Header */}
          <div className="bg-navy-900 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">AI Assistant — Online</span>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadHistory} title="Download conversation" className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg transition-colors">
                <Download size={16} />
              </button>
              <button onClick={clearChat} title="Clear chat" className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader size={16} className="text-blue-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (shown when only welcome message) */}
          {messages.length === 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  className="text-xs bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={sendMessage} className="flex gap-3">
              <textarea
                ref={inputRef}
                rows={1}
                className="flex-1 input-field resize-none"
                placeholder="Ask about visa requirements..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ maxHeight: '120px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn-primary flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl p-0"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-1.5 text-center">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
