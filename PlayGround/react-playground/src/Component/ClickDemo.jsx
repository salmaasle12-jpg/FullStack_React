export default function ClickDemo() {
  const handleClick = () => alert("Clicked!")
  return <button className="btn btn-warning" onClick={handleClick}>Click</button>
}