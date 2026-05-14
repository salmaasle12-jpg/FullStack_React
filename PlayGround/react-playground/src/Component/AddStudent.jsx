export default function AddStudent({ onAdd }) {
  return <button onClick={() => onAdd("New Student")}>Add</button>
}