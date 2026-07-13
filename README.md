# snupel

강원 스포츠 패스포트 정적 프론트엔드입니다. API는 `snupel-fastapi` 저장소에서 관리합니다.

```bash
npm ci
npm run dev
npm run lint
npm run build
```

`npm run build` 결과는 `out/`에 생성됩니다. 운영 환경에서는 Nginx가 정적 파일을 제공하고 `/api/*` 요청을 FastAPI로 전달합니다.

로컬에서 원격 API를 직접 사용할 때는 `NEXT_PUBLIC_API_BASE_URL=https://api.sportspassport.kr/api`를 설정합니다. 설정하지 않으면 기존 Nginx 프록시와 같은 상대 경로 `/api`를 사용합니다.
