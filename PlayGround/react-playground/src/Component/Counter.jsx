import { useState } from "react"
export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h4>{count}</h4>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  )
}