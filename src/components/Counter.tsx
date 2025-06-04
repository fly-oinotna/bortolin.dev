'use client'

import { useEffect, useState } from 'react'

export default function Counter({ countTo = 300, speed = 10 }) {

  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount >= countTo) {
          clearInterval(interval)
          return countTo
        }
        return prevCount + 1
      })
    }, speed)

    return () => clearInterval(interval)
  }, [])

  return count

}
