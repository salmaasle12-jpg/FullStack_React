import { useState } from "react"


import Hello from "./Component/Hello";
import StudentCard from "./Component/StudentCard";
import Counter from "./Component/Counter";
import StudentForm from './Component/StudentForm'
import ListDemo from './Component/ListDemo'
import Status from './Component/Status'
import ClickDemo from './Component/ClickDemo'
import LoadDemo from './Component/LoadDemo'
import Parent from './Component/Parent'

import AddExam from './Component/AddExam'
import ExamList from './Component/ExamList'
import ExamDetails from './Component/ExamDetails'

const initialExams = [
  { id: 1, title: "Math Exam", students: 20 },
  { id: 2, title: "React Quiz", students: 15 }
]

export default function App() {
  const [exams, setExams] = useState(initialExams)
  const [selected, setSelected] = useState(null)

  const addExam = (title) => {
    setExams([...exams, { id: Date.now(), title, students: 0 }])
  }

  const deleteExam = (id) => {
    setExams(exams.filter(e => e.id !== id))
  }

  return (
    <div className="container mt-4">

      <h2>React Playground</h2>

      <Hello />
      <StudentCard name="John Doe" grade="A" />
      <StudentCard name="Sara Cohen" grade="100" />
      <Counter />

      <hr />
      <StudentForm />
      <ListDemo />
      <Status isLogged={true} />
      <ClickDemo />
      <LoadDemo />
      <Parent />

      <hr />
      <h2>Exam Manager</h2>

      <AddExam onAdd={addExam} />

      <div className="row">
        <div className="col-6">
          <ExamList
            exams={exams}
            onSelect={setSelected}
            onDelete={deleteExam}
          />
        </div>

        <div className="col-6">
          <ExamDetails exam={selected} />
        </div>
      </div>

    </div>
  )
}