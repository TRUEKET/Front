import { useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import RequestProgress from "./RequestProgress.jsx";
import copyIcon from "../../../assets/icons/trueshot_copy.svg";
import pencilIcon from "../../../assets/icons/trueshot_pencil.svg";
import {
  getSellerMessage,
  getTrueShotRequest,
  renameTrueShotRequest,
  sendSellerMessage,
} from "../../../api/trueShot.js";

// 진행 중일 때 판매자 진행 상황을 다시 불러오는 간격(ms)
const POLL_MS = 5000;

// 헤더 아래 16px 띄우고(피그마 기준 제목 y=84) 16px 간격으로 나열
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 16px 12px;
  font-family: "Pretendard", sans-serif;
  line-height: normal;
  text-align: left;
`;

// 요청 이름 + 연필 버튼 (누르면 제목 자리가 입력칸으로 바뀜)
const StyledTitleRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0 16px;
`;

const titleFont = `
  color: #4e4a57;
  font-family: "esamanru", sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: normal;
`;

const StyledTitle = styled.h2`
  ${titleFont}
  margin: 0;
  overflow: hidden;
  letter-spacing: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 이름 수정 중일 때 제목 자리에 들어가는 입력칸 (제목과 같은 글자, 연보라 밑줄)
const StyledTitleInput = styled.input`
  ${titleFont}
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  border-bottom: 1px solid #cac0f2;
  border-radius: 0;
  outline: none;
  background: none;
`;

const StyledIconButton = styled.button`
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  img {
    display: block;
  }
`;

// 제목 최대 글자 수 (서버 PATCH /trueshot/{id} 기준)
const TITLE_MAX_LENGTH = 20;

// 검정 카드: 왼쪽 인증코드 | 점선 | 오른쪽 2번째 지시 (높이 121)
const StyledCodeCard = styled.section`
  display: flex;
  height: 121px;
  overflow: hidden;
  background: #191919;
  border-radius: 20px;
  color: #fdfdfd;
`;

const StyledCodeArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 21px;
  width: 178px;
  box-sizing: border-box;
  padding: 15px 0 0 29px;
`;

const StyledCodeLabel = styled.p`
  font-size: 16px;
  font-weight: 600;
`;

const StyledCode = styled.p`
  font-family: "esamanru", sans-serif;
  font-size: 30px;
  font-weight: 700;
  white-space: pre;
`;

// 회색 세로 점선 (굵기 2px, 약 4px 간격)
const StyledCodeDivider = styled.span`
  flex-shrink: 0;
  width: 2px;
  margin-top: -3px;
  background: repeating-linear-gradient(to bottom, #4e4a57 0 4.03px, transparent 4.03px 8.07px);
`;

const StyledInstructionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px 0 0 10px;
`;

const StyledInstructionLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
`;

// 2번째 지시 자리 (지금은 비어 있음)
const StyledInstructionBox = styled.div`
  width: 136px;
  height: 71px;
  background: #fdfdfd;
  border-radius: 10px;
`;

// 판매자 송신용 메시지 카드
const StyledMessageCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 1px solid #cac0f2;
  border-radius: 20px;
`;

const StyledMessageTitle = styled.p`
  color: #4e4a57;
  font-size: 16px;
  font-weight: 600;
`;

// 왼쪽 위만 각진 회색 말풍선 (빈 줄로 문단 구분)
const StyledMessage = styled.p`
  padding: 12px 16px;
  background: #a9a4b2;
  border-radius: 0 20px 20px 20px;
  color: #191919;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  white-space: pre-line;
`;

// 복사 아이콘 + 글씨
const StyledCopyButton = styled(MainButton)`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;

  img {
    display: block;
  }
`;

// 트루샷-구매자(요청 상세): 인증코드, 판매자에게 보낼 메시지·링크 전송(공유 시트, 없으면 복사), 진행 단계
// 촬영 대기(진행 중)일 때만 5초마다 다시 불러옴 (완료·실패·시간 만료되면 결과 화면으로, 화면을 벗어나면 멈춤)
// 판매자가 2차를 통과했어도 사진을 보내기 전(SHARE_WAITING)이면 진행 중이라 이 화면에 머물고, 보내면 결과 화면으로
export default function RequestDetail() {
  const { id } = useParams();
  // 불러오기 전 undefined, 없는 요청(404 등)이면 null
  const [request, setRequest] = useState(undefined);
  // 제목 수정 중이면 입력 중인 값, 아니면 null
  const [editingName, setEditingName] = useState(null);
  // 저장 중복 방지(Enter 후 입력칸이 사라질 때의 blur 등), Esc로 취소하면 저장 건너뜀
  const savingRef = useRef(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer = null;

    const load = async () => {
      try {
        const next = await getTrueShotRequest(id, { signal: controller.signal });
        setRequest(next);
        if (next.status === "pending") timer = setTimeout(load, POLL_MS);
      } catch (error) {
        if (error.name === "AbortError") return;
        // 처음 불러오기 실패면 트루샷 메인으로, 다시 불러오기 실패는 이전 화면 유지
        setRequest((prev) => prev ?? null);
      }
    };

    load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [id]);

  if (request === undefined) return <BackHeader label="뒤로가기" />;
  // 없는 요청이면 트루샷 메인으로
  if (!request) return <Navigate to="/trueshot" replace />;
  // 촬영 대기가 끝났으면(성공·실패·시간 만료) 결과 화면으로 (목록에서 누를 때와 같은 규칙)
  // 상세를 켜 둔 채 판정이 끝나도 진행 단계에 머물지 않고 인증 성공·실패를 바로 보여줌
  if (request.status !== "pending") return <Navigate to={`/trueshot/requests/${id}/result`} replace />;

  // 입력칸에서 벗어나면 저장 (비었거나 그대로면 저장 없이 원래 제목, 실패해도 원래 제목)
  const saveName = async () => {
    if (cancelRef.current) {
      cancelRef.current = false;
      return;
    }
    if (savingRef.current) return;
    const title = (editingName ?? "").trim();
    if (!title || title === request.name) {
      setEditingName(null);
      return;
    }
    savingRef.current = true;
    try {
      setRequest(await renameTrueShotRequest(id, title));
    } catch {
      // 저장 실패(400 등)면 원래 제목 그대로
    } finally {
      savingRef.current = false;
      setEditingName(null);
    }
  };

  // 연필 버튼: 지금 제목으로 입력칸 열기 (이전 Esc 취소 표시는 지움)
  const startEditing = () => {
    cancelRef.current = false;
    setEditingName(request.name);
  };

  // Enter 저장(한글 조합 중 Enter는 무시), Esc 취소
  const handleNameKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      cancelRef.current = true;
      setEditingName(null);
    }
  };

  return (
    <>
      <BackHeader label="뒤로가기" />
      <StyledContent>
        <StyledTitleRow>
          {editingName === null ? (
            <>
              <StyledTitle>{request.name}</StyledTitle>
              <StyledIconButton type="button" aria-label="요청 이름 수정" onClick={startEditing}>
                <img src={pencilIcon} alt="" />
              </StyledIconButton>
            </>
          ) : (
            <StyledTitleInput
              aria-label="요청 이름"
              value={editingName}
              maxLength={TITLE_MAX_LENGTH}
              enterKeyHint="done"
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={saveName}
              onKeyDown={handleNameKeyDown}
              autoFocus
            />
          )}
        </StyledTitleRow>

        <StyledCodeCard>
          <StyledCodeArea>
            <StyledCodeLabel>인증코드</StyledCodeLabel>
            <StyledCode aria-label={`인증코드 ${request.code}`}>{request.code.split("").join(" ")}</StyledCode>
          </StyledCodeArea>
          <StyledCodeDivider />
          <StyledInstructionArea>
            <StyledInstructionLabel>2번째 지시</StyledInstructionLabel>
            <StyledInstructionBox />
          </StyledInstructionArea>
        </StyledCodeCard>

        <StyledMessageCard>
          <StyledMessageTitle>판매자 송신용 메시지</StyledMessageTitle>
          <StyledMessage>{getSellerMessage()}</StyledMessage>
          <StyledCopyButton variant="accent" type="button" onClick={() => sendSellerMessage(request)}>
            <img src={copyIcon} alt="" />
            메시지·링크 전송하기
          </StyledCopyButton>
        </StyledMessageCard>

        <RequestProgress steps={request.progress} />
      </StyledContent>
    </>
  );
}
