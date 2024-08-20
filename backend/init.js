require("dotenv").config();
const apiKey = process.env.API_KEY || sample;
const fs = require("fs");

const startIdx1 = 1;
const endIdx1 = 1000;
const startIdx2 = 1001;
const endIdx2 = 2000;
const endPoint1 = `https://openapi.foodsafetykorea.go.kr/api/${apiKey}/COOKRCP01/json/${startIdx1}/${endIdx1}`;
const endPoint2 = `https://openapi.foodsafetykorea.go.kr/api/${apiKey}/COOKRCP01/json/${startIdx2}/${endIdx2}`;

// GET 요청을 보내고 JSON 데이터를 가져오는 함수
async function fetchData(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const responseData = await response.text();
    const data = JSON.parse(responseData);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

async function mergeData() {
  try {
    // 첫 번째 API 호출
    const data1 = await fetchData(endPoint1);
    if (!data1 || !data1.COOKRCP01) {
      throw new Error("Failed to fetch or parse data from the first endpoint.");
    }

    // 두 번째 API 호출
    const data2 = await fetchData(endPoint2);
    if (!data2 || !data2.COOKRCP01) {
      throw new Error(
        "Failed to fetch or parse data from the second endpoint."
      );
    }

    // row 배열을 합칩니다
    const mergedRow = [...data1.COOKRCP01.row, ...data2.COOKRCP01.row];

    // 전체 데이터 객체를 구성합니다
    const mergedData = {
      COOKRCP01: {
        total_count: parseInt(data1.COOKRCP01.total_count).toString(),
        row: mergedRow,
        RESULT: data1.COOKRCP01.RESULT, // assuming RESULT is the same for both
      },
    };

    // JSON 데이터를 temp.json 파일로 저장
    fs.writeFileSync("temp.json", JSON.stringify(mergedData, null, 2), "utf8");
    console.log("Data has been saved to temp.json");
  } catch (error) {
    console.error("Error during data merge:", error);
  }
}

// 실행
mergeData();
