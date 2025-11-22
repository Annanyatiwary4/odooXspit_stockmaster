import { Routes, Route } from "react-router-dom";
import { Login } from "./components/auth/login";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
    </Routes>
  );
}

export default App;
