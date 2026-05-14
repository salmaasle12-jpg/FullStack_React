export default function ExamDetails({ exam }) {
  if (!exam) return <h5>Select exam</h5>

  return (
    <div className="card p-3">
      <h3>{exam.title}</h3>
      <p>Students: {exam.students}</p>
    </div>
  )
}