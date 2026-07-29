"use client"

import dynamic from "next/dynamic"

export const NewProductForm = dynamic(() => import("@/app/seller/new-product-form").then(m => ({ default: m.NewProductForm })), { ssr: false })
