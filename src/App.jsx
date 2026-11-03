import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layout/RootLayout.jsx";
import Home from "./pages/home/Home.jsx";
import MyInfo from "./pages/myInfo/MyInfo.jsx";
import Response from "./pages/response/Response.jsx";
import TrueShot from "./pages/trueShot/TrueShot.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/myinfo" element={<MyInfo />} />
          <Route path="/response" element={<Response />} />
          <Route path="/trueshot" element={<TrueShot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
