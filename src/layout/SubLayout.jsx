import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/footer/Footer.jsx";

// 이의제기·판독 화면은 푸터 자리에 페이지 자체 하단 버튼이 오므로 탭바를 숨김
const HIDE_FOOTER_PREFIXES = ["/search/dispute", "/scan"];

// 메인 로고 헤더 없이, 각 페이지가 직접 넣는 BackHeader + 하단 탭바만 공통으로 보이는 레이아웃
export default function SubLayout() {
  const { pathname } = useLocation();
  const showFooter = !HIDE_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      <main>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </>
  );
}
