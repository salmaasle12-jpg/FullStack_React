import { useState } from "react"
export default function StudentForm() {
  const [name, setName] = useState("")

  return (
    <div className="mb-3">
      <input
        className="form-control"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h5 className="mt-2">{name}</h5>
    </div>
  )
}