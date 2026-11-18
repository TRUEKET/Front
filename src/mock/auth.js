// 인증 목업(mock/authApi.js)과 화면에서 쓰는 데이터

// 인증번호 유효 시간(초), 3분
export const VERIFY_TIME_LIMIT = 180;

// 개인정보 수집·이용 동의 시트 항목
// rows: 수집 항목 줄 (label: 소제목, desc: 항목, period: 보관 기간 배지)
// period가 항목 단위면 row 대신 카드 오른쪽에 배지가 붙음
export const PRIVACY_ITEMS = [
  {
    title: "회원가입",
    desc: "이메일, 비밀번호, 전화번호",
    purpose: "목적: 로그인, 1인 1계정 확인",
    period: "탈퇴 시",
  },
  {
    title: "신고·제보",
    rows: [
      {
        label: "의심 제보·사기 신고 공통",
        desc: "판매자·계좌·전화번호·SNS 계정·주요 대화 부분 사진",
        period: "1년/삭제·탈퇴 시",
      },
      {
        label: "사기 신고에만 해당되는 부분",
        desc: "송금 내역 사진(개인정보 제외)",
        period: "원본 즉시/ 계좌번호 1년",
      },
    ],
    purpose: "목적: 다른 사용자의 사기 조회, 받는 계좌 확인",
  },
  {
    title: "트루샷 요청",
    desc: "판매자 인증 사진(개인정보 제외)",
    purpose: "목적: 티켓 소지 확인",
    period: "7일",
  },
  {
    title: "판독",
    desc: "대화 캡쳐",
    purpose: "목적: 사기 신호 판독 및 리스트 검색",
    period: "저장하지 않음",
  },
];
