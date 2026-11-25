# 2001.exe — 실행 가이드 (Windows)

## 폴더 구조
```
2001exe/
├─ public/index.html   ← 사이트 화면 (디자인 + 채팅 화면)
├─ src/index.js        ← 서버 (실시간 채팅 / Durable Object)
├─ wrangler.jsonc      ← Cloudflare 설정
└─ package.json
```

## 1. 설치 확인 (PowerShell)
```
node -v
npm -v
```
버전 숫자가 나오면 OK.

## 2. 프로젝트 넣기
zip을 풀어서 `D:\2001exe` 에 두고:
```
cd D:\2001exe
npm install
```

## 3. 내 컴퓨터에서 테스트
```
npm run dev
```
브라우저에서 http://localhost:8787 접속 → 창을 2개 띄워서 서로 채팅되는지 확인.
끝낼 때는 PowerShell에서 Ctrl + C.

## 4. Cloudflare 로그인 & 배포
```
npx wrangler login     (브라우저가 열리면 '허용')
npm run deploy
```
기존 Worker `2001exe`에 그대로 덮어써져요. 배포가 끝나면
`https://2001exe.<내계정>.workers.dev` 주소가 나와요.

## 수정할 때
- 문구/디자인 → `public/index.html`
- 랜덤 닉네임 단어 → `src/index.js` 맨 위 `WORDS`
- 저장할 메시지 개수 → `src/index.js` 의 `MAX_HISTORY` (기본 100개)

수정 후 다시 `npm run deploy` 하면 반영됩니다.

## 관리자 기능
- 관리자 비밀번호 설정 (배포 전에 한 번):
  ```
  npx wrangler secret put ADMIN_KEY
  ```
  입력창이 나오면 원하는 비밀번호를 입력. (화면에 안 보여도 입력되고 있음)
- 로컬 테스트(npm run dev)용 비밀번호는 `.dev.vars` 파일에 있음 (기본값 test1234). 이 파일은 배포되지 않음.
- 로그인: 사이트 주소 끝에 `#admin`을 붙여서 접속 → 비밀번호 입력
  예) https://2001exe.내계정.workers.dev/#admin
- 메시지 옆 [삭제] = 그 메시지만 지움 / [차단] = 그 사람 IP 차단 + 그 사람 메시지 전부 삭제 + 즉시 강퇴
- 차단 해제: 관리자 모드의 "차단 목록" 버튼

## 자동 배포
GitHub `main` 브랜치에 올라가면 Cloudflare Workers가 자동으로 다시 배포합니다.
