"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquare, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceChatControls from "./VoiceChatControls";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
}

interface RoomChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
}

export default function RoomChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
}: RoomChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-12 right-6 z-50 w-full max-w-sm h-[480px] bg-canvas-dark border border-hairline/60 
                     rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-hairline bg-surface/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-link/10 border border-link/20 flex items-center justify-center text-link">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Live Room Chat
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-link/15 text-link">
                    Real-Time
                  </span>
                </h3>
                <p className="text-[11px] text-mute">
                  Messaging & Voice Call
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* In-Room Voice Chat Option */}
              <VoiceChatControls currentUserId={currentUserId} />

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-mute hover:text-foreground hover:bg-hairline/50 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-hairline/40 flex items-center justify-center text-mute mb-3">
                  <Sparkles className="w-6 h-6 text-link/60" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  No messages yet
                </p>
                <p className="text-[11px] text-mute mt-1 max-w-[200px]">
                  Say hello to team members in this room!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      isSelf ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar initial */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                      style={{
                        backgroundColor: msg.senderColor || "#58a6ff",
                      }}
                      title={msg.senderName}
                    >
                      {msg.senderName.charAt(0).toUpperCase() || (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div
                      className={`max-w-[78%] flex flex-col ${
                        isSelf ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-0.5">
                        <span className="text-[11px] font-semibold text-foreground/90">
                          {isSelf ? "You" : msg.senderName}
                        </span>
                        <span className="text-[9px] text-mute font-mono">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      <div
                        className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                          isSelf
                            ? "bg-link text-white rounded-tr-none"
                            : "bg-surface border border-hairline/80 text-foreground rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-hairline bg-surface/90 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-canvas border border-hairline/80 rounded-xl px-3.5 py-2 text-xs 
                       text-foreground placeholder:text-mute focus:outline-none focus:border-link transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-link text-white hover:bg-link/90 disabled:opacity-40 
                       disabled:hover:bg-link transition-all shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
