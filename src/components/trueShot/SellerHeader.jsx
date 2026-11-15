import styled from "styled-components";
import ticketIcon from "../../assets/icons/header_puple_tictek.svg";

// 위 12px, 양옆 16px 띄우고 높이 56 안에 로고를 세로 가운데
const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  height: 68px;
  padding: 12px 16px 0;
  box-sizing: border-box;
`;

// 아이콘 + TRUE:KET 글씨 (글씨는 아래쪽 맞춤)
const StyledLogo = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;

  img {
    display: block;
    width: 40px;
    height: 40px;
  }
`;

const StyledLogoText = styled.h1`
  margin: 0;
  color: #191919;
  font-family: "esamanru", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: normal;

  span {
    color: #5434d6;
  }
`;

// 판매자 트루샷 화면 헤더: 로고만 (판매자는 비회원일 수 있어 로그인 버튼·홈 이동 없음)
// TODO: 공통 Header에 버튼 숨김 옵션이 생기면 합치기 (Header.jsx가 #34와 겹쳐 지금은 따로 만듦)
export default function SellerHeader() {
  return (
    <StyledHeader>
      <StyledLogo>
        <img src={ticketIcon} alt="TRUE:KET 아이콘" />
        <StyledLogoText>
          TRUE<span>:KET</span>
        </StyledLogoText>
      </StyledLogo>
    </StyledHeader>
  );
}
