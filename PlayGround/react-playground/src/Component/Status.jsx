export default function Status({ isLogged }) {
  return isLogged ? <h4>Welcome</h4> : <h4>Please login</h4>
}