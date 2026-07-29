"use client"

import dynamic from "next/dynamic"

export const ChatContainer = dynamic(() => import("@/app/aichat/chat-container").then(m => ({ default: m.ChatContainer })), { ssr: false })
export const ChatContainerBendahara = dynamic(() => import("@/app/aichat-bendahara/chat-container").then(m => ({ default: m.ChatContainerBendahara })), { ssr: false })
