## 구동 방법

1. backend 폴더에 접속해주세요.

cd backend

2. package.json 의 파일을 설치해주세요.

npm install

3. 서버를 구동해주세요.

node server.js

4. 아래 서버가 출력되면 실행완료입니다.

stdout: Data has been saved to temp.json
Proxy Server running at http://localhost:3000/

5. main.html 라이브 서버로 실행시켜주세요.
   (detail.html은 main.html을 통해서만 접속 가능합니다.
   detail.html 단독으로 접속 시 main.html로 이동)

(vscode기준) Alt + L + O

---

## 총 작업시간 21시간(하루 7시간)

- 08.13(HTML + CSS = 75% main = 100%, detail = 50% )
- 08.19(HTML + CSS 마무리, JS 30% 작업 )
- 08.20 (JS 마무리 및 코드 정리)

## 참고API & 기획+피그마 링크

참고 API :
https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=COOKRCP01

기획+피그마 링크 :
https://www.figma.com/design/JdK9R51q9E64DuhwA7Dwfr/api%ED%99%9C%EC%9A%A9-%EC%9B%B9%EA%B0%9C%EB%B0%9C-%EC%95%BD%EC%8B%9D%EA%B8%B0%ED%9A%8D%EC%84%9C--(-5%ED%8C%80-)?node-id=0-1&t=otmq80kzYtpFJBQh-0

## 완료된 구현사항

- 메인화면 레이아웃 및 기본 CSS 구현
- 레시피 카드 클릭시 이동하는 상세페이지 레이아웃 및 기본 CSS 구현
- 레시피 이름 또는 재료로 레시피 검색 기능
- 출력된 레시피 리스트 페이지네이션 구현
- '오늘 뭐 먹지' 배너 클릭시 전체 레시피 중 랜덤으로 1개 레시피 출력(미흡)
- 레시피 상세화면 출력

## 미완료된 구현사항

- 에러 처리100% 및 에러 페이지
- 랜덤 음식 뽑기(룰렛 돌리기)
- 즐겨찾기 기능
- 반응형 디자인(1280px 미만)
- 외부 공유 기능(Share)
- 내 냉장고 관리 기능(내가 가지고 있는 재료가 포함된 레시피 출력 기능)
