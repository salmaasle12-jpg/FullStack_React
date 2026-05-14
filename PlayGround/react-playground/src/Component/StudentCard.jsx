export default function StudentCard({ name, grade }) {
  return (
    <div className="card p-2">
      <h5>{name}</h5>
      <p>Grade: {grade}</p>
    </div>
  )
}