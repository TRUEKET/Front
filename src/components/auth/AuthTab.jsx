import styled from "styled-components";

// 로그인 / 회원가입 탭
const AUTH_TABS = [
  { id: "login", title: "로그인", sub: "트루켓 계정이 있습니다." },
  { id: "signup", title: "회원가입", sub: "트루켓 계정이 없습니다." },
];

// 탭 두 개를 감싸는 흰 박스
const StyledTabs = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 8px 12px;
  background: #fdfdfd;
  border-radius: 20px;
  box-shadow: ${({ $shadow }) => ($shadow ? "0 1px 5px rgba(23, 21, 28, 0.2)" : "none")};
`;

// 선택된 탭은 연보라 + 그림자, 아닌 탭은 회색
const StyledTab = styled.button`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: ${({ $selected }) => ($selected ? "#e4deff" : "#dedbe5")};
  box-shadow: ${({ $selected }) => ($selected ? "0 1px 5px rgba(23, 21, 28, 0.2)" : "none")};
  color: ${({ $selected }) => ($selected ? "#191919" : "#4e4a57")};
  line-height: normal;
  text-align: left;
  cursor: pointer;
`;

const StyledTitle = styled.span`
  font-family: "esamanru", sans-serif;
  font-size: 20px;
  font-weight: 500;
`;

const StyledSub = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
`;

// 로그인·회원가입 화면 상단 탭 (shadow: 회원가입 화면처럼 바깥 박스에 그림자를 줄지)
export default function AuthTab({ value, onChange, shadow = false }) {
  return (
    <StyledTabs role="tablist" aria-label="로그인 또는 회원가입" $shadow={shadow}>
      {AUTH_TABS.map(({ id, title, sub }) => (
        <StyledTab
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          $selected={value === id}
          onClick={() => onChange(id)}
        >
          <StyledTitle>{title}</StyledTitle>
          <StyledSub>{sub}</StyledSub>
        </StyledTab>
      ))}
    </StyledTabs>
  );
}
