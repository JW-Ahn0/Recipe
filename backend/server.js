/* 
node 백엔드의 경우 많이 안다뤄봐서 
대부분의 코드는 chatGPT 참조해서 구현했습니다.

백엔드가 존재하는 이유
1. cors 이슈
2. API KEY의 요청횟수가 많지 않음(1계정 당 1000회가 MAX)
3. API 요청속도가 많이 느림

백엔드 설명:
서버가 구동할때 API 요청을 통해 전체 데이터를 파일로 저장하여 가지고 있음.
(서버 구동시 init.js에 있는 코드 실행, API로 전체 데이터 요청(2024.08.20 기준 1124개)하여 temp.json에 저장)


제공하는 API는 2가지입니다.

/data

-> 초기 구동시 생성한 temp.json 데이터 값 리턴합니다.

/proxy

-> 레시피 상세정보와 같은 정보는 api로 요청(프록시 서버 역할)
초기에 생성한 temp.json을 이용하면 더 쉽지만 API를 이용할 수 있다는 것을 보여주기 위해 사용했습니다..

*/

const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware"); // 프록시 미들웨어를 가져옵니다

const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY || sample;
const endPoint = `https://openapi.foodsafetykorea.go.kr/api/${apiKey}/COOKRCP01/json/`;

const app = express();

// JSON 파일 경로 설정
const filePath = path.join(__dirname, "temp.json");

// CORS 허용 설정
app.use(cors());

// GET 요청을 처리하는 핸들러
app.get("/data", (req, res) => {
  try {
    // JSON 파일을 읽고 텍스트로 변환
    const fileContent = fs.readFileSync(filePath, "utf8");

    // JSON 텍스트를 객체로 변환
    const data = JSON.parse(fileContent);

    // 클라이언트에 JSON 데이터 반환
    res.json(data);
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 프록시 미들웨어 설정
app.use(
  "/proxy",
  createProxyMiddleware({
    target: endPoint,
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "", // '/api'를 빈 문자열로 대체
    },
    onProxyReq: (proxyReq, req, res) => {
      // 요청 URL 로그
      console.log(
        `Proxying request to: ${proxyReq.getHeader("host")}${proxyReq.path}`
      );
    },
  })
);

// 서버 기동 시 초기화 작업을 수행하는 함수
async function initialize() {
  return new Promise((resolve, reject) => {
    exec("node init.js", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(stderr);
        return;
      }

      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
}

// 서버 기동 시 초기화 작업 수행
initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Proxy Server running at http://localhost:${port}/`);
    });
  })
  .catch((error) => {
    console.error("Initialization error:", error);
  });
