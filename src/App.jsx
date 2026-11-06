import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layout/RootLayout.jsx";
import SubLayout from "./layout/SubLayout.jsx";
import Home from "./pages/home/Home.jsx";
import MyInfo from "./pages/myInfo/MyInfo.jsx";
import Response from "./pages/response/Response.jsx";
import TrueShot from "./pages/trueShot/TrueShot.jsx";
import Search from "./pages/home/search/Search.jsx";
import DetailInfo from "./pages/home/search/DetailInfo.jsx";
import Dispute from "./pages/home/dispute/Dispute.jsx";
import DisputeReason from "./pages/home/dispute/DisputeReason.jsx";
import DisputeEvidence from "./pages/home/dispute/DisputeEvidence.jsx";
import DisputeComplete from "./pages/home/dispute/DisputeComplete.jsx";
import Scan from "./pages/home/scan/Scan.jsx";
import ScanLoading from "./pages/home/scan/ScanLoading.jsx";
import ScanResult from "./pages/home/scan/ScanResult.jsx";
import ReportForm from "./pages/home/report/ReportForm.jsx";

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
          <Route path="/search/detail" element={<DetailInfo />} />
          <Route path="/search/dispute" element={<Dispute />} />
          <Route path="/search/dispute/reason" element={<DisputeReason />} />
          <Route path="/search/dispute/evidence" element={<DisputeEvidence />} />
          <Route path="/search/dispute/complete" element={<DisputeComplete />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/scan/loading" element={<ScanLoading />} />
          <Route path="/scan/result" element={<ScanResult />} />
          <Route path="/scan/report" element={<ReportForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
