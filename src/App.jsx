import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layout/RootLayout.jsx";
import SubLayout from "./layout/SubLayout.jsx";
import Home from "./pages/home/Home.jsx";
import MyInfo from "./pages/myInfo/MyInfo.jsx";
import Response from "./pages/response/Response.jsx";
import Search from "./pages/home/search/Search.jsx";
import DetailInfo from "./pages/home/search/DetailInfo.jsx";
import Dispute from "./pages/home/dispute/Dispute.jsx";
import DisputeReason from "./pages/home/dispute/DisputeReason.jsx";
import DisputeEvidence from "./pages/home/dispute/DisputeEvidence.jsx";
import DisputeComplete from "./pages/home/dispute/DisputeComplete.jsx";
import Scan from "./pages/home/scan/Scan.jsx";
import ScanLoading from "./pages/home/scan/ScanLoading.jsx";
import ScanResult from "./pages/home/scan/ScanResult.jsx";
import Report from "./pages/home/report/Report.jsx";
import ReportResult from "./pages/home/report/ReportResult.jsx";
import ReportForm from "./pages/home/report/ReportForm.jsx";
import Auth from "./pages/auth/Auth.jsx";
import MyReports from "./pages/myInfo/MyReports.jsx";
import MyReportDetail from "./pages/myInfo/MyReportDetail.jsx";
import AccountEdit from "./pages/myInfo/AccountEdit.jsx";
import BuyerHome from "./pages/trueShot/buyer/BuyerHome.jsx";
import RequestDetail from "./pages/trueShot/buyer/RequestDetail.jsx";
import RequestResult from "./pages/trueShot/buyer/RequestResult.jsx";
import SellerSession from "./pages/trueShot/seller/SellerSession.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/myinfo" element={<MyInfo />} />
          <Route path="/response" element={<Response />} />
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
          <Route path="/scan/report" element={<ReportForm mode="scan" />} />
          <Route path="/report" element={<Report />} />
          <Route path="/report/loading" element={<ScanLoading nextPath="/report/result" />} />
          <Route path="/report/result" element={<ReportResult />} />
          <Route path="/report/form" element={<ReportForm mode="report" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/myinfo/reports" element={<MyReports />} />
          <Route path="/myinfo/reports/:id" element={<MyReportDetail />} />
          <Route path="/myinfo/account" element={<AccountEdit />} />
          <Route path="/trueshot" element={<BuyerHome />} />
          <Route path="/trueshot/requests/:id" element={<RequestDetail />} />
          <Route path="/trueshot/requests/:id/result" element={<RequestResult />} />
          <Route path="/trueshot/seller/:id" element={<SellerSession />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
