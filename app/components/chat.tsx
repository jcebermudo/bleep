"use client"

import { useEffect, useRef, useState} from "react"

export default function Chat(){
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const chatRef = useRef<HTMLDivElement>(null)
}