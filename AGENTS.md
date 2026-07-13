# 개발 지침

## Next.js

- 이 프로젝트의 Next.js 버전에는 학습 데이터와 다른 변경 사항이 있을 수 있다. 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 관련 문서와 deprecation 안내를 확인한다.

## API 구조

- API 코드는 도메인별로 `dto`, `repository`, `service`, `router` 계층을 구분한다.
- `dto`: 요청·응답 스키마와 타입을 정의하고 입력값을 검증한다.
- `repository`: DB 조회와 변경만 담당한다.
- `service`: 비즈니스 규칙과 트랜잭션 흐름을 담당한다.
- `router`: HTTP 요청·응답, 상태 코드, 인증 처리 후 service를 호출한다. Next.js 엔트리인 `route.ts`는 router에 위임한다.
- 의존 방향은 `router -> service -> repository`로 유지한다. 상위 계층이나 다른 도메인의 내부 구현을 역참조하지 않는다.

## 테스트

- API router를 추가하거나 동작을 변경하면 테스트 코드도 작성한다.
- router 테스트는 최소한 성공 응답, 잘못된 입력, 인증·권한 실패, 주요 service 오류의 상태 코드와 응답 본문을 검증한다.
- 외부 API와 DB는 테스트에서 직접 호출하지 않는다.
- 변경 완료 전 `npm test`와 `npm run lint`를 실행한다.

## 구현 원칙

- 요청·응답 형식은 Zod 스키마를 단일 기준으로 사용하고 OpenAPI 문서와 일치시킨다.
- 사용자 입력은 router 경계에서 검증하고, 비밀번호·토큰·개인정보를 로그나 응답에 노출하지 않는다.
- 같은 로직을 여러 router에 복사하지 말고 기존 공용 함수나 service를 재사용한다.
- 새 의존성이나 추상화는 기존 코드와 표준 기능으로 해결할 수 없을 때만 추가한다.
- DB 스키마 변경에는 Drizzle migration을 포함한다.
