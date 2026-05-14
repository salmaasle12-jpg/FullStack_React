export default function ExamList({ exams, onSelect, onDelete }) {
  return (
    <>
      {exams.map(e => (
        <div key={e.id} className="card p-2 mb-2">
          <h5>{e.title}</h5>

          <button onClick={() => onSelect(e)}>View</button>
          <button onClick={() => onDelete(e.id)}>Delete</button>
        </div>
      ))}
    </>
  )
}