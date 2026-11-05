import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layout/RootLayout.jsx";
import SubLayout from "./layout/SubLayout.jsx";
import Home from "./pages/home/Home.jsx";
import MyInfo from "./pages/myInfo/MyInfo.jsx";
import Response from "./pages/response/Response.jsx";
import TrueShot from "./pages/trueShot/TrueShot.jsx";
import Search from "./pages/home/Search.jsx";
import SearchResult from "./pages/home/SearchResult.jsx";
import DetailInfo from "./pages/home/DetailInfo.jsx";

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
        <Route element={<SubLayout />}>
          <Route path="/search" element={<Search />} />
          <Route path="/search/result" element={<SearchResult />} />
          <Route path="/search/detail" element={<DetailInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
