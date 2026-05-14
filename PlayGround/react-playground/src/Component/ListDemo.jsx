const students = ["Avi", "Dana", "Noa"]

export default function ListDemo() {
  return (
    <ul>
      {students.map((s, i) => <li key={i}>{s}</li>)}
    </ul>
  )
}