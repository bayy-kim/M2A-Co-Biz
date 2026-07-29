"use client"

import dynamic from "next/dynamic"

export const LandingClient = dynamic(() => import("./landing-client").then(m => ({ default: m.LandingClient })), { ssr: false })
