import { useState } from "react"
export default function AddExam({ onAdd }) {
  const [title, setTitle] = useState("")

  return (
    <div className="mb-3">
      <input
        className="form-control"
        placeholder="Exam name"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button
        className="btn btn-primary mt-2"
        onClick={() => onAdd(title)}
      >
        Add Exam
      </button>
    </div>
  )
}
