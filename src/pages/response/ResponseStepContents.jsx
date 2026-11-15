import styled from "styled-components";

const ECRM_URL = "https://ecrm.police.go.kr/minwon/main";
const FSS_URL = "https://pd.fss.or.kr";

// 단계 안내 문구 + 항목 목록
const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #191919;
`;

const StyledDesc = styled.p`
  font-size: 12px;
  font-weight: 500;
`;

// 회색 항목들을 세로로 나열 (폭 302)
const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  max-width: 302px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

// 회색 칩 ($padding: 칩 안쪽 여백)
const StyledChip = styled.li`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ $padding }) => $padding};
  background: #dedbe5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
`;

// 신고하기 단계의 넓은 회색 박스
const StyledBox = styled.li`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  background: #dedbe5;
  border-radius: 10px;
`;

const StyledBoxTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
`;

const StyledLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
`;

// 지급정지 설명 흰 박스
const StyledNote = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: #fdfdfd;
  border-radius: 10px;
`;

const StyledNoteTitle = styled.p`
  font-size: 12px;
  font-weight: 600;
`;

const StyledNoteDesc = styled.p`
  font-size: 10px;
  font-weight: 500;
`;

// 보라 밑줄 외부 링크 (새 탭으로 열기)
const StyledLink = styled.a`
  align-self: flex-start;
  border-bottom: 1px solid #5434d6;
  color: #5434d6;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
`;

const ExternalLink = ({ href, children }) => (
  <StyledLink href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </StyledLink>
);

// 1. 추가 송금 멈추기: 재입금을 유도하는 문구 예시
const RESEND_PHRASES = [
  "\"입금자명이 틀렸어요, 닉네임으로 다시 보내주세요\"",
  "“수수료가 빠진 채로 입금되었어요”",
  "“계좌 오류인 것 같아요\"",
  "“업체에서 명의 확인이 안돼요\"",
  "\"다시 보내면 처음 돈은 환불해 드릴게요\"",
];

export function StopTransferContent() {
  return (
    <StyledBody>
      <StyledDesc>
        이미 입금했는데 약속받은 티켓을 받지 못했다면 추가 송금은 2차 피해로 이어질 수 있습니다.
        <br />
        아래의 문구들은 재입금을 유도해 더 큰 피해로 이어질 수 있습니다.
      </StyledDesc>
      <StyledList>
        {RESEND_PHRASES.map((phrase) => (
          <StyledChip key={phrase} $padding="10px">
            {phrase}
          </StyledChip>
        ))}
      </StyledList>
    </StyledBody>
  );
}

// 2. 증거 수집하기: 모아둘 자료 (마지막 줄은 번호 없는 추가 항목)
const EVIDENCE_ITEMS = ["대화 전체 캡쳐", "판매자 프로필 + SNS 계정 주소(아이디, 링크)", "판매글 캡쳐", "계좌번호, 은행, 예금주", "입금 내역(이체확인증)"];

export function CollectEvidenceContent() {
  return (
    <StyledBody>
      <StyledDesc>빠르고 확실한 신고 및 대응을 위해서는 피해당한 배경과 과정을 상세하게 담는 것이 좋습니다.</StyledDesc>
      <StyledList>
        {EVIDENCE_ITEMS.map((item, index) => (
          <StyledChip key={item} $padding="10px">
            {index + 1}. {item}
          </StyledChip>
        ))}
        <StyledChip $padding="10px">+ 받은 인증 사진, 결제 링크 주소, 전화번호 등</StyledChip>
      </StyledList>
    </StyledBody>
  );
}

// 3. 전달된 정보 유출 막기
export function BlockLeakContent() {
  return (
    <StyledBody>
      <StyledDesc>아이디, 비밀번호, 개인정보를 넘겼다면 바로 바꿔야 해요.</StyledDesc>
      <StyledList>
        <StyledChip $padding="8px 12px">1. 예매처 비밀번호 바꾸기</StyledChip>
        <StyledChip $padding="8px 12px">2. 예매처에 계정 도용 알리기</StyledChip>
        <StyledChip $padding="8px 12px">
          3. 신분증 제공 시 개인정보노출자 등록
          <ExternalLink href={FSS_URL}>금융감독원 바로 가기 →</ExternalLink>
        </StyledChip>
      </StyledList>
    </StyledBody>
  );
}

// 4. 신고하기
export function ReportContent() {
  return (
    <StyledBody>
      <StyledDesc>티켓 거래 사기 신고는 온라인으로 접수합니다.</StyledDesc>
      <StyledList>
        <StyledBox>
          <StyledBoxTitle>온라인 신고 접수</StyledBoxTitle>
          <StyledLines>
            <p>경찰청 사이버범죄 시스템(ECRM)</p>
            <p>유형: 직거래 사기</p>
            <p>환불 관련 문제인가요? - 아니오</p>
          </StyledLines>
          <ExternalLink href={ECRM_URL}>ECRM 바로 가기 →</ExternalLink>
        </StyledBox>
        <StyledBox>
          <StyledBoxTitle>은행에 지급정지 문의</StyledBoxTitle>
          <StyledLines>
            <p>티켓 거래 사기는 지급정지가 반려될 수 있습니다.</p>
            <StyledNote>
              <StyledNoteTitle>지급정지란?</StyledNoteTitle>
              <StyledNoteDesc>
                사기범 계좌에서 돈이 나가지 못하게 은행이 막아두는 것.
                <br />
                계좌에 남아 있는 돈만 지킬 수 있어요.
              </StyledNoteDesc>
            </StyledNote>
          </StyledLines>
        </StyledBox>
        <StyledBox>
          <StyledBoxTitle>거래한 사이트에서의 신고</StyledBoxTitle>
          <StyledLines>
            <p>X, 당근, 카페 등의 거래한 사이트에서 판매자 계정을 신고해 다음 피해를 줄일 수 있습니다.</p>
          </StyledLines>
        </StyledBox>
      </StyledList>
    </StyledBody>
  );
}
