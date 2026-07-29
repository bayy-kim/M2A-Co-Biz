"use client"

import dynamic from "next/dynamic"

export const CheckoutForm = dynamic(() => import("@/app/checkout/checkout-form").then(m => ({ default: m.CheckoutForm })), { ssr: false })
