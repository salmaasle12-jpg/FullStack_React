import AddStudent from "./AddStudent"
import { useState } from "react"
export default function Parent() {
  const [students, setStudents] = useState([])

  const addStudent = (name) => {
    setStudents([...students, name])
  }

  return (
    <>
      <AddStudent onAdd={addStudent} />
      {students.map((s, i) => <div key={i}>{s}</div>)}
    </>
  )
}