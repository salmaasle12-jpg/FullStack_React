import { useEffect } from "react"
export default function LoadDemo() {
  useEffect(() => {
    console.log("Component Loaded")
  }, [])

  return <h4>Loaded</h4>
}