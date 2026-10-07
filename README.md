# 강원 스포츠 패스포트

강원특별자치도의 스포츠 관광 정보를 탐색하고, 미션에 참여해 나만의 스포츠 패스포트를 완성하는 정적 프론트엔드 웹 서비스입니다.

- **이 저장소 `snupel`:** Next.js 화면과 브라우저용 API 클라이언트. 빌드 결과는 정적 파일이며 서버 API·DB 스키마·마이그레이션은 포함하지 않습니다.
- **백엔드 저장소 [`snupel-fastapi`](https://github.com/snupels/snupel-fastapi):** FastAPI의 `/api/*`, 인증·권한·비즈니스 로직, 관광 데이터 동기화, MySQL 모델과 Alembic 마이그레이션을 관리합니다.
- **운영 배포:** 이 저장소는 S3·CloudFront로 정적 파일을 배포합니다. 브라우저는 `https://api.sportspassport.kr/api`의 별도 FastAPI 서버를 호출하며, 백엔드·DB 배포는 FastAPI 저장소에서 관리합니다.

## 서비스 개요

강원 18개 시군의 스포츠 관광 자원(산악·동계·해양·육상, 올림픽 레거시 포함)을 한 곳에서 탐색하고,
방문 기록과 체험 인증, 리워드 기능까지 연결해 실제 참여를 유도하는 **스포츠 관광 특화** 서비스입니다.

일반 관광 플랫폼이 관광지·숙박·음식·교통을 포괄적으로 제공하는 것과 달리,
본 서비스는 스포츠 종목·지역·이벤트 등 스포츠 관광에 필요한 핵심 정보에 집중합니다.

## 핵심 기능

1. **스포츠 관광 정보 탐색과 지도**
   - 종목·지역 다중 선택으로 스포츠 장소·등산로· 걷기·자전거 코스를 통합 검색
   - 시설 유형, 코스 안내, 공식 홈페이지, 카카오 지도에서 위치와 지역 밀집도 확인
   - 한국관광공사 관광정보·두루누비 코스, 강원 해양레저·스키장·골프장·산소길 데이터 병합 제공

2. **여행 조건 기반 맞춤 코스 추천**
   - 로그인 후 지역·종목·테마·여유 시간, 방문 이력을 반영한 코스 추천
   - 추천 장소와 방문 순서, 예상 체류·이동 시간, 길 찾기 안내 제공

3. **사진 인증과 패스포트 미션북**
   - 현장 사진 제출, 운영자 승인 방식의 미션 인증
   - 지역·종목별 스탬프북, 조건별 배지, 패스포트 등급 관리

4. **행사 탐색과 방문 준비**
   - 강원 지역 스포츠·축제 상세 조회, 행사 저장, 구글 캘린더 일정 추가
   - 지역별 지도에서 함께 방문할 스포츠 장소 탐색

5. **스포츠 피드와 이용자 교류**
   - 공개 동의한 미션 인증 사진으로 사진·댓글·좋아요·팔로우, 공개 프로필 제공

6. **기타**
   - 일반·카카오·구글 로그인,회원 정보·프로필 관리
   - 강원 18개 시군 날씨 조회(기상청 단기예보, 실패 시 Open-Meteo 보완)

## 사용된 데이터 소스

- 한국관광공사 OpenAPI (국문 관광정보, 두루누비 정보)
- 강원특별자치도 파일데이터 (스키장·골프장, 해양레저, 산소길)
- Kakao Maps JavaScript API, Kakao Local REST API
- 기상청 단기예보 / Open-Meteo Forecast API
- OpenRouter API (코스 구성·추천 사유 생성)
- Google OAuth 2.0 / 카카오 로그인 REST API

## 프로젝트 구조

```
snupel/
├── app/                 # Next.js App Router (라우트, 레이아웃)
├── components/          # 재사용 React 컴포넌트
├── lib/                 # 화면 표시용 데이터 변환과 유틸리티
│   └── api/             # FastAPI 호출과 프론트엔드 요청·응답 검증
├── imports/             # 디자인 자료, 이미지 자산
├── public/              # 정적 자산, 이미지
├── tests/               # 자동 회귀 테스트 (Node test runner)
├── out/                 # `npm run build` 생성 정적 출력
└── nginx/               # 별도 Nginx 호스팅 참고 설정(현재 배포에 미사용)
```

## 개발

```bash
npm ci
npm run dev      # 개발 서버
npm run lint     # ESLint
npm run build    # 정적 빌드 → out/
npm test         # 타입 체크 + 테스트
```

로컬 화면에서도 기본값으로 운영 FastAPI API를 호출합니다. 개발용 API가 필요하면 `NEXT_PUBLIC_API_BASE_URL`을 빌드·실행 전에 설정하세요. 이 저장소에서 DB를 만들거나 마이그레이션하지 않습니다. 백엔드 실행과 DB 준비는 [FastAPI README](https://github.com/snupels/snupel-fastapi#readme)를 따릅니다.

## 배포

- `main` 푸시 또는 수동 실행으로 `.github/workflows/deploy.yml`이 테스트·린트·정적 빌드 후 S3에 업로드합니다.
- CloudFront 배포 ID를 확인한 뒤 업로드하고 캐시 무효화 완료까지 기다립니다. 기존 해시 자산은 이전 HTML을 위해 보존합니다.
- 업로드 전에 현재 S3 파일을 내려받아 `previous-site-실행ID-시도번호` 아티팩트로 7일 보관합니다. 다운로드·홈 파일 확인·아티팩트 저장 실패 시 배포가 중단됩니다. 배포 역할에는 해당 버킷의 `s3:GetObject`도 필요합니다.
- `nginx/`는 별도 Nginx 호스팅 시 참고할 설정이며 현재 배포 워크플로에서 사용하지 않습니다.
- 기본 API 주소는 `https://api.sportspassport.kr/api`이며, `NEXT_PUBLIC_API_BASE_URL`로 재정의할 수 있습니다. 이 값과 `NEXT_PUBLIC_*` 설정은 정적 빌드 시점에 반영됩니다.

## 정책 및 지원

- privacy, service, 마케팅 이메일/SMS 약관: `app/terms/` 하위 페이지
- 지원: `cs@sportspassport.kr`, 공식 인스타그램: `@sportspassport_kr`
