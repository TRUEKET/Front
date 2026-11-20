import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import MainButton from "../common/MainButton.jsx";
import InfoChipRow from "../myInfo/InfoChipRow.jsx";
import { logout, maskPhoneLast4 } from "../../api/auth.js";

// 화면 전체를 덮는 반투명 배경 (누르면 닫힘)
const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.25);
`;

// 가운데 연보라 카드 (폭 358)
const StyledPopup = styled.div`
  position: absolute;
  top: calc(50% + 1px);
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: calc(min(100%, 390px) - 32px);
  box-sizing: border-box;
  padding: 12px 16px;
  background: #f3eff5;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
  transform: translate(-50%, -50%);
`;

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledTitle = styled.p`
  color: #4e4a57;
  font-size: 16px;
  font-weight: 700;
`;

// 로그아웃하기 · 정보 수정하기 (반씩)
const StyledActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

// 헤더의 번호 뒷자리를 누르면 뜨는 내 정보 팝업
// 로그아웃은 지금 화면에 그대로 (로그인이 필요한 화면은 각 화면이 /auth로 보냄)
export default function MyInfoPopup({ user, onClose }) {
  const navigate = useNavigate();

  // 팝업이 떠 있는 동안 뒤 화면 스크롤 막기
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleEdit = () => {
    onClose();
    navigate("/myinfo/account");
  };

  return (
    <StyledOverlay onClick={onClose}>
      <StyledPopup role="dialog" aria-modal="true" aria-label="내 정보" onClick={(e) => e.stopPropagation()}>
        <StyledInfo>
          <StyledTitle>내 정보</StyledTitle>
          <InfoChipRow label="이메일" value={user.email} />
          <InfoChipRow label="비밀번호" value="********" />
          <InfoChipRow label="전화번호" value={maskPhoneLast4(user.phoneLast4)} />
        </StyledInfo>
        <StyledActions>
          <MainButton variant="outline" type="button" onClick={handleLogout}>
            로그아웃하기
          </MainButton>
          <MainButton type="button" onClick={handleEdit}>
            정보 수정하기
          </MainButton>
        </StyledActions>
      </StyledPopup>
    </StyledOverlay>
  );
}
