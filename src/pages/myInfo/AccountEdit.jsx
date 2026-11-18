import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/header/BackHeader.jsx";
import MainButton from "../../components/common/MainButton.jsx";
import ScanConfirmModal from "../../components/scan/ScanConfirmModal.jsx";
import PhoneVerify from "../../components/auth/PhoneVerify.jsx";
import InfoChipRow from "../../components/myInfo/InfoChipRow.jsx";
import PasswordChangeCard from "../../components/myInfo/PasswordChangeCard.jsx";
import useCurrentUser from "../../hooks/useCurrentUser.js";
import { changePhone, logout, withdraw } from "../../api/auth.js";

// 헤더 아래 16px 띄우고(피그마 기준 제목 y=84) 16px 간격, 로그아웃·탈퇴는 화면 아래쪽 (탭바 자리 100px 제외)
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100svh - 56px - 100px);
  box-sizing: border-box;
  padding: 28px 16px 0;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

const StyledTitle = styled.h2`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: normal;
`;

const StyledDivider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: none;
  background: #dedbe5;
`;

// 로그아웃 버튼 + 탈퇴 링크 (아래로 붙임)
const StyledBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  margin-top: auto;
`;

// 피그마의 회색 버튼 모양 그대로, 실제로는 눌림
const StyledLogoutButton = styled(MainButton)`
  background: #dedbe5;
  color: #a9a4b2;
`;

// 밑줄 텍스트 버튼
const StyledWithdrawButton = styled.button`
  padding: 0;
  border: none;
  border-bottom: 1px solid #4e4a57;
  background: none;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  cursor: pointer;
`;

// 내 계정 정보 수정 (/myinfo/account, 로그인 필요: App.jsx의 RequireLogin이 막음)
// 비밀번호·전화번호는 '변경하기'를 누르면 카드가 펼쳐지고, 저장하면 다시 접혀 바뀐 값을 보여줌
export default function AccountEdit() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [editing, setEditing] = useState({ password: false, phone: false });
  const [newPhone, setNewPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const openEditor = (key) => setEditing((prev) => ({ ...prev, [key]: true }));
  const closeEditor = (key) => setEditing((prev) => ({ ...prev, [key]: false }));

  const handlePhoneSave = async () => {
    await changePhone(newPhone);
    setNewPhone("");
    setPhoneVerified(false);
    closeEditor("phone");
  };

  // 홈으로 먼저 보낸 뒤 로그아웃 (이 화면의 로그인 가드가 안내 화면을 띄우지 않게)
  const handleLogout = () => {
    navigate("/");
    logout();
  };

  const handleWithdraw = async () => {
    navigate("/");
    await withdraw();
  };

  return (
    <>
      <BackHeader label="내 정보" />
      <StyledContent>
        <StyledTitle>내 계정 정보 수정하기</StyledTitle>
        <StyledDivider />

        <InfoChipRow label="이메일" value={user.email} />

        {editing.password ? (
          <PasswordChangeCard onSaved={() => closeEditor("password")} />
        ) : (
          <InfoChipRow label="비밀번호" value="********" actionLabel="변경하기" onAction={() => openEditor("password")} />
        )}

        {editing.phone ? (
          <PhoneVerify shadow gap={16} phone={newPhone} onPhoneChange={setNewPhone} onVerifiedChange={setPhoneVerified}>
            <MainButton type="button" disabled={!phoneVerified} onClick={handlePhoneSave}>
              저장하기
            </MainButton>
          </PhoneVerify>
        ) : (
          <InfoChipRow label="전화번호" value={user.phone} actionLabel="변경하기" onAction={() => openEditor("phone")} />
        )}

        <StyledBottom>
          <StyledLogoutButton type="button" onClick={handleLogout}>
            로그아웃하기
          </StyledLogoutButton>
          <StyledWithdrawButton type="button" onClick={() => setIsWithdrawOpen(true)}>
            탈퇴하기
          </StyledWithdrawButton>
        </StyledBottom>
      </StyledContent>

      {isWithdrawOpen && (
        <ScanConfirmModal
          message={
            <>
              탈퇴 후에는 되돌릴 수 없습니다.
              <br />
              탈퇴하시겠습니까?
            </>
          }
          confirmLabel="탈퇴하기"
          onClose={() => setIsWithdrawOpen(false)}
          onConfirm={handleWithdraw}
        />
      )}
    </>
  );
}
