const $categoryList = document.getElementById("category-card-con").children;
const $pageNumberList = document.getElementById("page-number-list");
const $searchInput = document.getElementById("search-input");

//로컬 백엔드 주소
const local = "http://127.0.0.1:3000/data";

//모든 레시피 담아두는 곳
let allRecipeList = [];
//화면에 표시할 레시피 모아두는 곳
let currentRecipeList = [];
//페이지별 보이는 아이템 개수 (조정 가능)
let itemsPerPage = 9;
//한 그룹에 보이는 페이지 개수 (조정 가능)
let pagesPerGroup = 10;
//현재 활성화된 페이지(이전, 다음 누를 때 기억하기 위해 사용)
let currentActivePage = 0;
//검색창 입력 값
let inputValue = "";

async function init() {
  // 백드롭 표시
  showBackdrop();
  try {
    //전체 데이터 요청
    allRecipeList = await fetchData(local);
    //화면에 표시할 레시피를 업데이트
    updateCurrentList(allRecipeList);
    //클릭 및 입력 이벤트 초기화
    initEvent();
  } catch (error) {
    console.error("Error in fetchData:", error);
  } finally {
    // 백드롭 숨김
    hideBackdrop();
  }
}

async function initEvent() {
  //카테고리 리스트
  const $categoryCardList =
    document.getElementById("category-card-con").children;
  //음식 이름 또는 재료 검색 버튼(주황버튼)
  const $searchButton = document.getElementById("search-keyword-btn");
  //'오늘 뭐 뭑지?' 배너
  const $randomBanner = document.getElementById("banner-con");

  //'오늘 뭐 뭑지?' 배너 클릭 이벤트
  $randomBanner.addEventListener("click", onClickRandomBanner);

  // 카테고리
  for (const e of $categoryList) {
    e.addEventListener("click", (e) => {
      for (const child of $categoryList) {
        child.classList.remove("category-active");
      }
      e.currentTarget.classList.add("category-active");
      inputRecvoer();
    });
  }
  for (const e of $categoryCardList) {
    e.addEventListener("click", (e) => {
      const categoryKeyword = e.currentTarget.dataset.value;
      const list = allRecipeList.filter(
        (recipe) => recipe.RCP_PAT2 === categoryKeyword
      );
      categoryKeyword === "전체"
        ? updateCurrentList(allRecipeList)
        : updateCurrentList(list);
    });
  }

  //페이지네이션
  document.getElementById("next-page").addEventListener("click", (e) => {
    movePage(true);
  });
  document.getElementById("prev-page").addEventListener("click", (e) => {
    movePage(false);
  });

  //검색창
  $searchInput.addEventListener("keyup", (e) => {
    inputValue = e.target.value.trim();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.ketyCode === 13) {
      searchKeywordFromList(inputValue, allRecipeList);
      categoryUIRecover();
    }
  });
  $searchButton.addEventListener("click", (e) => {
    searchKeywordFromList(inputValue, allRecipeList);
    categoryUIRecover();
  });
}
/*
 list안에 있는 keyword가 포함되어 있는 값들로만 새로운 리스트 만들어서
 그걸로 화면 그리는 함수 (검색 시 사용)
*/
async function searchKeywordFromList(keyword, list) {
  const tempList = list.filter(
    (recipe) =>
      recipe.RCP_NM.includes(keyword) || recipe.RCP_PAT2.includes(keyword)
  );
  updateCurrentList(tempList);
}

/*
  배열 list가 인자로 들어오면 해당 list로 currentRecipeList 업데이트 하고,
  화면 다시 그리는 함수 (검색 시 사용)
*/
async function updateCurrentList(list) {
  let tempList = [];
  if (list && Array.isArray(list)) {
    currentRecipeList = Array.from(list);
    tempList = currentRecipeList.slice(0, 0 + itemsPerPage);
  }
  updateList(tempList);
  updatePagnation(1);
}

/*
    배열 list가 인자로 들어오면 화면에 표시되던 리스트 지우고 새로 그리는 함수.
    한 화면에 그리는 개수는 itemsPerPage 개수까지 표시 가능.
*/
async function updateList(list) {
  const $recipeCardList = document.getElementById("recipe-card-list");
  const $noResult = document.getElementById("no-result");

  $recipeCardList.innerHTML = "";
  if (list.length === 0 || !list) {
    $noResult.classList.remove("d-none");
    return;
  }
  $noResult.classList.add("d-none");
  const fragment = document.createDocumentFragment();
  list.forEach((element, index) => {
    if (index > itemsPerPage - 1) return;
    const newElement = document.createElement("li");
    newElement.innerHTML = `
    <img src="${element.ATT_FILE_NO_MK}" alt="레시피 이미지" />
    <div class="recipe-info">
    <strong>${element.RCP_NM}</strong>
    <div class="recipe-detail-info">
        <span>${element.INFO_ENG}kcal</span>
        <button class="category-btn">${element.RCP_PAT2}</button>
    </div>
    </div>
    `;
    newElement.addEventListener("click", (e) => {
      window.location = `./detail.html?RCP_NM=${element.RCP_NM}`;
    });
    fragment.appendChild(newElement); // fragment에 요소 추가
  });
  $recipeCardList.appendChild(fragment);
}
/*
  pageNumber 가 있는 페이지 그룹으로 화면을 그리고, pageNumber 페이지를 활성화하는 함수
*/
async function updatePagnation(pageNumber) {
  const $recipeCardPagnation = document.getElementById("recipe-card-pagnation");
  const totalCnt = currentRecipeList.length;
  // 리스트에 값이 없는 경우 그냥 display-none 처리
  totalCnt === 0
    ? $recipeCardPagnation.classList.add("d-none")
    : $recipeCardPagnation.classList.remove("d-none");
  // 리스트 개수랑 한 화면에 나올 수 있는 아이템 개수로 최대 페이지 수 구함
  const maxPage =
    totalCnt % itemsPerPage === 0
      ? totalCnt / itemsPerPage
      : parseInt(totalCnt / itemsPerPage) + 1;
  // 현재 페이지가 속한 페이지 그룹을 계산 (13페이지 클릭시 이게 1~10 그룹인지, 11~20 그룹인지 판단)
  const currentGroup = Math.ceil(pageNumber / pagesPerGroup);
  const startPage = (currentGroup - 1) * pagesPerGroup + 1;
  const endPage =
    startPage + pagesPerGroup - 1 > maxPage
      ? maxPage
      : startPage + pagesPerGroup - 1;
  currentActivePage = pageNumber;
  makePagnation(startPage, endPage, pageNumber);
}

/*
  startPage 부터 endPage까지 만들고, actviePage에 page-active 클래스 주는 함수

  startPage : 페이지 그릴 초기 숫자
  endPage : 페이지 그릴 마지막 숫자
  activePage : 활성화 되어있는 페이지 숫자, 만약 그리는 것 들중에 activePage가 있는 경우 디자인 다르게
*/
async function makePagnation(startPage, endPage, activePage) {
  $pageNumberList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let i = startPage; i <= endPage; i++) {
    const element = document.createElement("div");
    element.classList.add("page-number-btn");
    element.innerText = i;
    //페이지를 그리는데 만약에 현재 페이지에 해당 하는 경우, page-active 추가
    if (activePage && i === activePage) element.classList.add("page-active");
    if (i === currentActivePage) element.classList.add("page-active");

    //페이지네이션 버튼 누르는 경우 이벤트
    element.addEventListener("click", (e) => {
      //해당 숫자로 페이지네이션 업데이트
      updatePagnation(i);
      let list = currentRecipeList.slice(
        i * itemsPerPage - itemsPerPage,
        i * itemsPerPage
      );
      //해당 페이지에 해당하는 리스트로 레시피 리스트 업데이트
      updateList(list);
      //검색창에 있는 값 초기화
      inputRecvoer();
    });
    fragment.appendChild(element);
  }
  $pageNumberList.appendChild(fragment);
}
/*
  pagnation 에서 이전, 다음 버튼 누르면 페이지네이션 화면 전환하는 함수
  isNext : 다음인경우 true, 이전인경우 false
*/
async function movePage(isNext) {
  const totalCnt = currentRecipeList.length;
  let startPage = 0;
  let endPage = 0;
  // '>'버튼(다음) 인 경우
  if (isNext) {
    //현재 보여줄 수 있는 레시피들중 마지막 페이지
    const maxPage =
      totalCnt % itemsPerPage === 0
        ? totalCnt / itemsPerPage
        : parseInt(totalCnt / itemsPerPage) + 1;

    startPage = parseInt($pageNumberList.firstChild.innerText);
    //다음 페이지 그룹이 없는 경우는 리턴
    if (startPage + pagesPerGroup > maxPage) return;
    //다음 페이지 시작 숫자
    startPage = startPage + pagesPerGroup;
    //다음 페이지 끝 숫자, maxPage 보다 클 수는 없으므로 그런 경우 maxPage로 출력
    endPage =
      startPage + pagesPerGroup - 1 > maxPage
        ? maxPage
        : startPage + pagesPerGroup - 1;
  }
  //'<'버튼(이전) 인 경우
  else {
    startPage = $pageNumberList.firstChild.innerText;
    //1보다 작은 경우는 리턴
    if (startPage - pagesPerGroup < 1) return;

    startPage = startPage - pagesPerGroup;
    endPage = startPage + pagesPerGroup - 1;
  }
  //startPage, endPage로 페이지내이션 화면 그리는 함수
  makePagnation(startPage, endPage);
}
/*
    카테코리 UI만 초기화 해주는 함수(검색,Random 배너 클릭시에 카테고리 UI 변경해줘야 함)
*/
function categoryUIRecover() {
  for (let i = 0; i < $categoryList.length; i++) {
    i === 0
      ? $categoryList[i].classList.add("category-active")
      : $categoryList[i].classList.remove("category-active");
  }
}
/*
    inputUI 초기화 해주는 함수(카테코리 클릭, Random 배너 클릭시에 input 창 초기화)
*/
function inputRecvoer() {
  $searchInput.value = "";
  inputValue = "";
}
/*
    랜덤 배너 클릭시 1개 레시피 랜덤으로 골라서 리스트에 출력
    ps : 시간이 더 있었다면 최소 모달에 표시 or 이상형 월드컵 게임 등의 아이디어를 구현하고 싶었으나 실패했습니다..
*/
async function onClickRandomBanner() {
  const n = allRecipeList.length;
  const randomNumber = Math.floor(Math.random() * n) + 1;
  currentRecipeList = [allRecipeList[randomNumber]];
  updateList(currentRecipeList);
  updatePagnation(1);
  categoryUIRecover();
  inputRecvoer();
}

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
    return data.COOKRCP01.row;
  } catch (error) {
    console.error("Fetch error:", error);
    alert(
      "서버 연결에 실패했습니다. 서버 상태를 확인해주세요.\n기본 페이지로 이동합니다."
    );
    throw new Error("Fetch error:", error);
  }
}

// 백드롭 표시
function showBackdrop() {
  backdrop.style.display = "flex";
}

// 백드롭 숨김
function hideBackdrop() {
  backdrop.style.display = "none";
}

init();
