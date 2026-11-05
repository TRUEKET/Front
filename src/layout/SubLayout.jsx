import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer.jsx";

// 메인 로고 헤더 없이, 각 페이지가 직접 넣는 BackHeader + 하단 탭바만 공통으로 보이는 레이아웃
export default function SubLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
