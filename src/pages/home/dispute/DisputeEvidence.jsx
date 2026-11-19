import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../../components/header/BackHeader.jsx";
import MainButton from "../../../components/common/MainButton.jsx";
import removeIcon from "../../../assets/icons/dispute_photo_sample.svg";
import uploadIcon from "../../../assets/icons/dispute_upload.svg";
import { MOCK_DISPUTE_REASONS } from "../../../mock/disputeReason.js";
import { MOCK_DISPUTE_EVIDENCE } from "../../../mock/disputeEvidence.js";
import { createDispute } from "../../../api/dispute.js";

const MAX_DESCRIPTION = 400;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 업로드 줄 맨 앞 예시 타일의 대화 말풍선 막대 (위치, 크기, 색)
const EXAMPLE_BARS = [
  { left: 8.09, top: 6.93, width: 43.911, height: 9.244, color: "#c9c3b8" },
  { left: 20.8, top: 20.8, width: 52, height: 8.089, color: "#dad0ff" },
  { left: 8.09, top: 33.51, width: 52, height: 13.867, color: "#e7e3dc" },
  { left: 27.73, top: 52, width: 45.067, height: 15.022, color: "#dad0ff" },
];

// Figma 글자 행간이 자동(normal)이라 line-height:normal로 맞춤 (16px 글자 → 19px 높이)
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  line-height: normal;
  text-align: left;
`;

const StyledHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
`;

const StyledTitle = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
`;

// 이유 선정에서 고른 이유를 보여주는 연보라 칩
const StyledReasonChip = styled.span`
  padding: 8px 12px;
  border-radius: 10px;
  background: #e4deff;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
  color: #261760;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
`;

// 증빙 카드·설명·이메일 묶음 + 동의 체크
const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 기타 이유의 증빙 카드만 좌우 18px, 간격 7px
const StyledEvidenceCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $wide }) => ($wide ? "7px" : "8px")};
  padding: ${({ $wide }) => ($wide ? "12px 18px" : "12px 16px")};
  overflow: hidden;
  background: #ffffff;
  border-radius: 20px;
`;

// 카드 제목 + 안내 문구 ($wide: 기타 이유 카드는 제목과 문구 사이 7px)
const StyledCardTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $wide }) => ($wide ? "7px" : "4px")};
`;

const StyledCardTitle = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
`;

const StyledCardSub = styled.p`
  margin: 0;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: ${({ $large }) => ($large ? "14px" : "12px")};
  font-weight: 500;

  strong {
    font-weight: 600;
  }
`;

const StyledCardBullets = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

const StyledCardDivider = styled.hr`
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px ${({ $dashed }) => ($dashed ? "dashed" : "solid")} #dedbe5;
`;

// 올린 캡쳐 썸네일 + 캡쳐 추가 타일을 가로로 나열
const StyledTiles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

// 업로드 줄 맨 앞 예시 타일 (대화 캡쳐 모양 그림, 누를 수 없음)
const StyledExampleTile = styled.div`
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 80.889px;
  height: 104px;
  overflow: hidden;
  background: #fdfdfd;
  border: 1.156px solid #ddd8cf;
  border-radius: 11.556px;
`;

// 예시 타일 안의 말풍선 막대 하나
const StyledExampleBar = styled.span`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  background: ${({ $color }) => $color};
  border-radius: 5.778px;
`;

const StyledThumb = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 80.889px;
  height: 104px;
  overflow: hidden;
  background: #fdfdfd;
  border: 1.156px solid #ddd8cf;
  border-radius: 11.556px;
`;

const StyledThumbImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 썸네일 바깥 테두리 기준 위 4.84px, 왼쪽 56.96px (테두리 두께 1.156px만큼 빼서 배치)
const StyledRemoveButton = styled.button`
  position: absolute;
  top: calc(4.84px - 1.156px);
  left: calc(56.96px - 1.156px);
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  img {
    display: block;
  }
`;

// 점선 테두리의 캡쳐 추가 타일 (누르면 이미지 선택창)
const StyledAddTile = styled.label`
  display: flex;
  flex-direction: column;
  gap: 13.867px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 80.889px;
  height: 104px;
  background: #fdfdfd;
  border: 1.156px dashed #c9c3b8;
  border-radius: 5.778px;
  color: #4e4a57;
  font-family: "Pretendard", sans-serif;
  font-size: 16.178px;
  font-weight: 500;
  cursor: pointer;

  input {
    display: none;
  }

  img {
    display: block;
  }
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledFieldLabel = styled.p`
  margin: 0;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
`;

const StyledRequired = styled.span`
  color: #a81e14;
`;

// 흰 둥근 입력 박스 (설명 textarea, 이메일 input 공통 겉모양)
const StyledInputBox = styled.div`
  display: flex;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 1px 5px rgba(23, 21, 28, 0.2);
`;

const inputTextStyle = `
  width: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: none;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;

  &::placeholder {
    color: #a9a4b2;
  }
`;

const StyledTextarea = styled.textarea`
  ${inputTextStyle}
  height: 47px;
  line-height: normal;
  resize: none;
`;

const StyledEmailInput = styled.input`
  ${inputTextStyle}
  height: 17px;
`;

const StyledErrorText = styled.p`
  margin: 0;
  color: #a81e14;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

// 동의 체크박스 (15px 네모 + 문구)
const StyledAgree = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #191919;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;

  input {
    display: none;
  }
`;

// 체크되면 보라색으로 채우고 흰 체크 표시
const StyledCheckBox = styled.span`
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 15px;
  height: 15px;
  border: 1px solid ${({ $checked }) => ($checked ? "#5434d6" : "#191919")};
  background: ${({ $checked }) => ($checked ? "#5434d6" : "transparent")};

  &::after {
    content: "";
    display: ${({ $checked }) => ($checked ? "block" : "none")};
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid #fdfdfd;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

// 푸터 자리에 고정되는 제출하기 버튼 영역 (좌우 16px 여백, 화면 폭 390 기준)
const StyledBottomAction = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 14px;
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 16px;
`;

// 안내 문구의 {account}를 조회한 계좌로 바꿔 넣음 (boldAccount면 계좌만 굵게)
function renderSub(sub, account, boldAccount) {
  const [before, after] = sub.split("{account}");
  if (after === undefined) return sub;
  return (
    <>
      {before}
      {boldAccount ? <strong>{account}</strong> : account}
      {after}
    </>
  );
}

// 이유 선정 다음 단계: 이유별로 필요한 증빙 캡쳐, 설명, 결과 받을 이메일을 입력받음
export default function DisputeEvidence() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reason = state?.reason ?? "normal";
  const account = state?.account ?? "";
  const config = MOCK_DISPUTE_EVIDENCE[reason];
  const reasonLabel = MOCK_DISPUTE_REASONS.find(({ id }) => id === reason)?.title;

  // 카드 id별 올린 캡쳐 목록 ({ id, url, file }), 서버가 증빙 종류별로 1장씩 받아서 카드당 1장
  const [uploads, setUploads] = useState({});
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 화면을 떠날 때 미리보기용 임시 URL 정리
  const uploadsRef = useRef(uploads);
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);
  useEffect(
    () => () => {
      Object.values(uploadsRef.current).flat().forEach(({ url }) => URL.revokeObjectURL(url));
    },
    []
  );

  const addFiles = (cardId, fileList) => {
    const added = [...fileList].map((file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file), file }));
    setUploads((prev) => ({ ...prev, [cardId]: [...(prev[cardId] ?? []), ...added] }));
  };

  const removeFile = (cardId, fileId) => {
    setUploads((prev) => {
      const target = prev[cardId].find(({ id }) => id === fileId);
      URL.revokeObjectURL(target.url);
      return { ...prev, [cardId]: prev[cardId].filter(({ id }) => id !== fileId) };
    });
  };

  const descriptionTooLong = description.length > MAX_DESCRIPTION;
  const canSubmit =
    config.cards.every(({ id }) => (uploads[id]?.length ?? 0) > 0) &&
    !descriptionTooLong &&
    (!config.descriptionRequired || description.trim() !== "") &&
    EMAIL_PATTERN.test(email.trim()) &&
    agreed &&
    !submitting;

  // 증빙을 서버로 보내고 접수 결과(접수번호, 통과/반려)를 완료 화면에 넘김
  // AI가 증빙을 확인하느라 몇 초 걸려서 그동안 버튼을 막아 둠
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await createDispute({
        identifier: state?.identifier ?? "",
        reason,
        description: description.trim(),
        sellerEmail: email.trim(),
        evidence: Object.fromEntries(config.cards.map(({ id }) => [id, uploads[id][0].file])),
      });
      navigate("/search/dispute/complete", {
        state: {
          ...state,
          email: email.trim(),
          receiptNo: result.receiptNo,
          disputeStatus: result.status,
          resultMessage: result.message,
        },
        replace: true,
      });
    } catch (error) {
      setSubmitError(error.message);
      setSubmitting(false);
    }
  };

  const descriptionField = (
    <StyledField>
      <StyledFieldLabel>
        설명 {config.descriptionRequired ? <StyledRequired>(필수)</StyledRequired> : "(선택)"}
      </StyledFieldLabel>
      <StyledInputBox>
        <StyledTextarea
          placeholder={config.descriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </StyledInputBox>
      {descriptionTooLong && <StyledErrorText>최대 400자입니다.</StyledErrorText>}
    </StyledField>
  );

  const evidenceCards = config.cards.map(({ id, title, sub, boldAccount, bullets, largeSub, divider }) => (
    <StyledEvidenceCard key={id} $wide={largeSub}>
      <StyledCardTexts $wide={largeSub}>
        <StyledCardTitle>{title}</StyledCardTitle>
        <StyledCardSub $large={largeSub}>{renderSub(sub, account, boldAccount)}</StyledCardSub>
        {bullets && (
          <StyledCardBullets>
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </StyledCardBullets>
        )}
      </StyledCardTexts>
      {divider && <StyledCardDivider $dashed={divider === "dashed"} />}
      <StyledTiles>
        <StyledExampleTile aria-hidden="true">
          {EXAMPLE_BARS.map(({ left, top, width, height, color }) => (
            <StyledExampleBar
              key={`${left}-${top}`}
              $left={left}
              $top={top}
              $width={width}
              $height={height}
              $color={color}
            />
          ))}
        </StyledExampleTile>
        {(uploads[id] ?? []).map((file) => (
          <StyledThumb key={file.id}>
            <StyledThumbImage src={file.url} alt="" />
            <StyledRemoveButton type="button" aria-label="캡쳐 삭제" onClick={() => removeFile(id, file.id)}>
              <img src={removeIcon} alt="" />
            </StyledRemoveButton>
          </StyledThumb>
        ))}
        {/* 카드당 1장만 받아서 올리면 추가 타일을 숨김 (서버는 PNG, JPEG만 받음) */}
        {(uploads[id]?.length ?? 0) === 0 && (
          <StyledAddTile>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                addFiles(id, e.target.files);
                e.target.value = "";
              }}
            />
            <img src={uploadIcon} alt="" />
            캡쳐 추가
          </StyledAddTile>
        )}
      </StyledTiles>
    </StyledEvidenceCard>
  ));

  return (
    <>
      <BackHeader label="뒤로 가기" />
      <StyledContent>
        <StyledHeading>
          <StyledTitle>증빙 자료 업로드</StyledTitle>
          <StyledReasonChip>{reasonLabel}</StyledReasonChip>
        </StyledHeading>

        <StyledBody>
          <StyledSections>
            {config.descriptionFirst ? (
              <>
                {descriptionField}
                {evidenceCards}
              </>
            ) : (
              <>
                {evidenceCards}
                {descriptionField}
              </>
            )}
            <StyledField>
              <StyledFieldLabel>결과 수신용 이메일</StyledFieldLabel>
              <StyledInputBox>
                <StyledEmailInput
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </StyledInputBox>
            </StyledField>
          </StyledSections>

          <StyledAgree>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <StyledCheckBox $checked={agreed} />
            사실과 일치하지 않을 시 불이익이 발생할 수 있다는 것을 인지했습니다.
          </StyledAgree>
          {submitError && <StyledErrorText>{submitError}</StyledErrorText>}
        </StyledBody>
      </StyledContent>

      <StyledBottomAction>
        <MainButton variant="accent" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? "증빙 확인 중..." : "제출하기"}
        </MainButton>
      </StyledBottomAction>
    </>
  );
}
