# snupel

강원 스포츠 패스포트 정적 프론트엔드입니다. API는 `snupel-fastapi` 저장소에서 관리합니다.

```bash
npm ci
npm run dev
npm run lint
npm run build
```

`npm run build` 결과는 `out/`에 생성됩니다. 운영 환경에서는 Nginx가 정적 파일을 제공하고 `/api/*` 요청을 FastAPI로 전달합니다.

기본 API 주소는 `https://api.sportspassport.kr/api`입니다. 다른 서버를 사용할 때만 `NEXT_PUBLIC_API_BASE_URL`로 재정의합니다.
