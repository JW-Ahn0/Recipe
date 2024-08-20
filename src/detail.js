// URL 쿼리 파라미터 읽기
const urlParams = new URLSearchParams(window.location.search);
const recipeName = urlParams.get("RCP_NM");

// URL 인코딩 적용
const encodedRecipeName = encodeURIComponent(recipeName);
const proxy = "http://127.0.0.1:3000/proxy";
const proxyQuery = `/1/1/RCP_NM=${encodedRecipeName}`;

let detailData = null;

async function init() {
  showBackdrop(); // 백드롭 표시
  try {
    const result = await fetchData(proxy + proxyQuery);
    if (result) {
      detailData = result.COOKRCP01.row["0"];
      setDetail(detailData);
    } else {
      console.error("No result from fetchData.");
    }
  } catch (error) {
    console.error("Error in fetchData:", error);
    alert("문제가 발생했습니다. 다시 시도해주세요.\n메인 페이지로 이동합니다.");
    window.location = "./main.html";
  } finally {
    hideBackdrop(); // 백드롭 숨김
  }
}
/*
  data로 상세화면 세팅하는 함수
  ps : 반복을 줄일 수 있을 것 같은데.. 시간이 없는 관계로 패스 했습니다.
*/
function setDetail(data) {
  const $recipeTitle = document.getElementById("recipe-title");
  const $reciepeCategory = document.getElementById("reciepe-category");
  const $recipeMainImg = document.getElementById("recipe-main-img");

  const $kcalValue = document.getElementById("kcal-value");
  const $carValue = document.getElementById("car-value");
  const $fatValue = document.getElementById("fat-value");
  const $proValue = document.getElementById("pro-value");
  const $nalValue = document.getElementById("na-value");

  const $tipP = document.getElementById("tip-p");
  if (data) {
    $recipeMainImg.src = data.ATT_FILE_NO_MK;
    $recipeTitle.innerText = data.RCP_NM;
    $reciepeCategory.innerText = data.RCP_PAT2;

    $kcalValue.innerText = data.INFO_ENG + "kcal";
    $carValue.innerText = data.INFO_CAR + "g";
    $fatValue.innerText = data.INFO_FAT + "g";
    $proValue.innerText = data.INFO_PRO + "g";
    $nalValue.innerText = data.INFO_NA + "mg";

    $tipP.innerText = data.RCP_NA_TIP;

    //재료 세팅
    setIngredient(data.RCP_PARTS_DTLS);
    //조리 순서 세팅
    setOrderList(data);
  } else {
    console.error("No data available to set.");
  }
}

//재료 화면 세팅하는 함수
async function setIngredient(detailStr) {
  let dataList = [];
  // 최초에 ","를 기준으로 분리
  for (const temp of detailStr.split(",")) {
    // 그렇게 분리한 값을 또 "\n" 개행을 기준으로 분리
    const splitList = temp.split("\n");
    for (const str of splitList) {
      dataList.push(str);
    }
  }
  const ingredientList = [];
  const $ingredientList = document.getElementById("ingredient-list");
  for (const str of dataList) {
    // 특수문자 ● 가 들어 간 경우네는 사용X '●순두부 양념장'와 재료가 아닌 값들이 들어가 있음
    if (str && !str.includes("●")) {
      ingredientList.push(str.trim());
    }
  }
  $ingredientList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= ingredientList.length; i++) {
    const element = document.createElement("li");
    element.innerHTML = `
      <input id="ingredient-item${i}" type="checkbox" />
      <label for="ingredient-item${i}">${ingredientList[i - 1]}</label>
    `;
    fragment.appendChild(element);
  }
  $ingredientList.appendChild(fragment);
}

//조리 순서 세팅
async function setOrderList(detailData) {
  const $recipeOrderList = document.getElementById("recipe-order-list");
  $recipeOrderList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  //API 기준 20개가 고정
  for (let i = 1; i <= 20; i++) {
    const number = i.toString().padStart(2, "0");
    const imgKey = "MANUAL_IMG" + number;
    const textKey = "MANUAL" + number;
    //값이 둘 다 있는 것들만 사용
    if (detailData[imgKey] && detailData[textKey]) {
      const element = document.createElement("li");
      element.classList.add("recipe-order-card");
      element.innerHTML = `
      <img src="${detailData[imgKey]}" alt="레시피 이미지" />
      <div class="recipe-explain-con">
        <span class="number-design">${i}</span>
        <p>${detailData[textKey].replace(i + ".", "")}</p>
      </div>
      `;
      fragment.appendChild(element);
    }
    $recipeOrderList.appendChild(fragment);
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data; // 서버에서 받은 데이터 반환
  } catch (error) {
    console.error(error);
    alert(
      "서버 연결에 실패했습니다. 서버 상태를 확인해주세요.\n메인 페이지로 이동합니다."
    );
    window.location = "./main.html";
    return null;
  }
}

function showBackdrop() {
  backdrop.style.display = "flex"; // 백드롭 표시
}

function hideBackdrop() {
  backdrop.style.display = "none"; // 백드롭 숨김
}

init();
