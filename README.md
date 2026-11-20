<div align="center">

# TRUE:KET

**보내기 전에, 확인을 한 번에!**

보내기 전엔 확인하고, 당한 뒤엔 바로 대응하는 티켓 거래 안전 서비스

[서비스 바로가기](https://trueket.vercel.app)

</div>

<br>

## 📌 서비스 소개

티켓, 상품권은 인터넷 사기 피해 1위(2025년 상반기 31,053건)임. 팬들은 인증샷 요청, 계좌 조회, X 검색을 여러 플랫폼을 오가며 직접 확인하지만, 미리 찍어둔 인증샷은 이미 뚫렸고 처음 쓰는 계좌는 신고 기록이 없어 그대로 통과됨.

트루켓은 **입금 직전**에 대화 속 수상한 말을 짚고, 판매자가 **지금** 표를 가졌는지 확인하고, 당한 뒤에는 할 일을 순서대로 안내함.

> 어떻게 하면 수법이 바뀌고 마음이 급한 순간에도, 입금 전에 이 거래가 안전한지 확인할 수 있을까?

<br>

## ✨ 주요 기능

### 1. 대화 판독
- 판매자와 나눈 대화 캡처(최대 10장)를 넣으면 거래 사기 위험도를 안내함
- 사기가 노리는 행동 6가지(로그인 정보 요구, 수상한 송금 요구, 확인 회피, 판단 재촉, 불리한 조건, 정보 불일치)에 걸리는 문장을 근거와 함께 표시
- 대화 속 계좌번호, 전화번호, X 계정을 신고 리스트와 자동 대조
- AI는 근거만 찾고, 위험, 의심, 안전 단계는 서버 규칙이 정함
- 로그인 없이 사용 가능

### 2. 트루샷 실시간 인증
- 구매자가 만든 링크(30분, 1회)를 판매자에게 전달
- 판매자는 가입 없이 링크로 접속해 인증코드 종이 + 예매 화면 촬영(1차, 3분)
- QR, 이름, 예매번호는 자동으로 가린 뒤 판매자가 추가로 가림
- 1차 통과 후 무작위 손 미션 공개, 1분 안에 2차 촬영
- 손 모양, 위치는 브라우저에서 MediaPipe로 인식하고 서버가 비교

### 3. 신고 리스트 & 신고하기
- 판독 결과를 바탕으로 의심 제보, 사기 신고 등록
- 신고 정보는 익명으로 1년간 노출, 다음 팬이 판독하거나 조회할 때 자동 확인
- 전체 값을 다 입력해야만 결과가 보이는 조회 방식으로 개인정보 노출, 장난 신고 방지
- 계좌 주인은 증빙을 첨부해 이의제기 가능, 게시자가 유지 또는 삭제 결정

### 4. 대처 & 내 정보
- 추가 송금 멈추기, 증거 수집, 정보 유출 막기, 신고하기 순서로 할 일 안내
- 내 정보에서 내 신고 내역과 들어온 이의제기 확인, 응답

<br>

## 🔄 유저 플로우

| 사용자 | 흐름 |
| --- | --- |
| 구매자, 보내기 전 | 홈 → 캡처 넣기 → 판독 결과 → 트루샷 요청 → 결과 확인 → 송금 또는 멈춤 |
| 판매자, 링크로만 | 링크 열기 → 동의 → 1차 촬영(3분) → 가리기 → 2차 미션(1분) → 직접 전송 |
| 구매자, 피해 후 | 대처 탭 → 사기 피해 신고 → 신고 사실 증빙 → 신고 리스트 기록 → 다른 팬들에게 공유 |

<br>

## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | React 19, Vite |
| Routing | React Router |
| Styling | styled-components |
| 손 인식 | MediaPipe Tasks Vision |
| Deploy | Vercel |
| Lint | ESLint |

<br>

## 🏗 아키텍처

```
구매자 웹, 판매자 웹 (React, Vercel)
        │  /api/* → Vercel rewrites
        ▼
API 서버 (Spring Boot, AWS EC2)
        │
        ├─ AI 읽기: OpenAI(판독, 증빙, 사진 판정)
        ├─ 서버 규칙: 위험, 의심, 안전 결정
        └─ 데이터: Supabase PostgreSQL, Storage
```

- 프론트는 `/api`로 요청하고, 개발 서버는 Vite 프록시, 배포는 Vercel rewrites로 백엔드에 전달
- 같은 주소로 요청하는 구조라 세션 쿠키가 그대로 오감
- 로그인은 세션 쿠키 + CSRF 방식, 공통 요청 함수(`src/api/client.js`)가 쿠키 포함과 CSRF 토큰 처리를 자동으로 함

<br>

## 📁 폴더 구조

```
src
├── api          # API 요청 함수 (client.js 공통 요청 + 기능별 파일)
├── assets       # 폰트, 아이콘, 이미지
├── components   # 공통, 기능별 컴포넌트
├── hooks        # 커스텀 훅 (로그인 사용자, 카운트다운 등)
├── layout       # RootLayout, SubLayout
├── mock         # 목데이터, 고정 선택지
├── pages
│   ├── auth       # 로그인, 회원가입
│   ├── home       # 홈, 판독, 조회, 신고, 이의제기
│   ├── trueShot   # 트루샷 구매자, 판매자
│   ├── response   # 대처
│   └── myInfo     # 내 정보, 내 신고, 계정 수정
└── utils        # 날짜 형식, 가리기 박스 계산
```

<br>

## 🚀 시작하기

```bash
git clone https://github.com/TRUEKET/front.git
cd front
npm install
cp .env.example .env.local
npm run dev
```

### 환경 변수

| 이름 | 설명 |
| --- | --- |
| `VITE_USE_MOCK` | `true`면 서버 없이 목업으로 동작 |
| `VITE_API_PROXY_TARGET` | 개발 서버 `/api` 프록시가 요청을 보낼 백엔드 주소 (기본값 `http://localhost:8080`) |

- `.env.local`은 git에 올리지 않음
- `.env.local` 수정 후에는 개발 서버를 다시 실행해야 적용됨

### 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |

<br>

## 👥 팀원

| PD | FE | FE | BE | BE | BE |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 이소이 | 정시훈 | 최서영 | 박수빈 | 오아름 | 조윤지 |

<br>

## 🎯 Git Convention

- 🎉 **Start:** Start New Project [:tada:]
- ✨ **Feat:** 새로운 기능을 추가 [:sparkles:]
- 🐛 **Fix:** 버그 수정 [:bug:]
- 🎨 **Design:** CSS 등 사용자 UI 디자인 변경 [:art:]
- ♻️ **Refactor:** 코드 리팩토링 [:recycle:]
- 🔧 **Settings:** Changing configuration files [:wrench:]
- 🗃️ **Comment:** 필요한 주석 추가 및 변경 [:card_file_box:]
- ➕ **Dependency/Plugin:** Add a dependency/plugin [:heavy_plus_sign:]
- 📝 **Docs:** 문서 수정 [:memo:]
- 🔀 **Merge:** Merge branches [:twisted_rightwards_arrows:]
- 🚀 **Deploy:** Deploying stuff [:rocket:]
- 🚚 **Rename:** 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우 [:truck:]
- 🔥 **Remove:** 파일을 삭제하는 작업만 수행한 경우 [:fire:]
- ⏪️ **Revert:** 전 버전으로 롤백 [:rewind:]

## 🌲 Branch Convention

- **`main`**: 배포 가능한 브랜치, 항상 배포 가능한 상태를 유지
- **`develop`**: 다음 버전을 위한 개발 브랜치, 팀원들의 작업 결과물이 모이는 '중심점'
- **`ui/#이슈번호/명칭`**: 화면 UI 구현이나 스타일링 작업을 할 때 사용
- **`api/#이슈번호/명칭`**: 데이터 통신, API 연동, 비즈니스 로직 구현 시 사용

## 🌊 Flow

1. Issue 생성
2. 최신 상태의 **`develop`** 에서 새 브랜치 생성
3. 작업 완료 후 **`develop`**으로 Pull Request
4. 팀원들에게 리뷰 요청
5. 리뷰한 팀원이 **`develop`** 으로 병합
6. 병합 후 작업자가 해당 브랜치 삭제