document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle");
  const expBox = document.querySelector(".exp");
  const resultContent = document.querySelector(".result-content");
  const resetBtn = document.querySelector(".reset");
  const dan = document.querySelector(".dan");

  let activeTooltip = null;
  let firstUnit = null;
  let firstValue = null;
  let firstUnitName = null;

  // 백엔드 API URL
  const API_BASE_URL = "백엔드 API URL";

  // API id 매핑
  const unitIdMap = {
    "피코": "pico",
    "나노": "nano",
    "마이크로": "micro",
    "밀리": "milli",
    "센티": "centi",
    "데시": "deci",
    "데카": "deca",
    "헥토": "hecto",
    "킬로": "kilo",
    "메가": "mega",
    "기가": "giga",
    "테라": "tera"
  };

  // 백엔드에서 단위 정보 가져오는 함수
  async function getUnitInfo(unitId) {
    const response = await fetch(`${API_BASE_URL}/${unitId}`);

    if (!response.ok) {
      throw new Error("API 요청 실패");
    }

    return await response.json();
  }

  dan.addEventListener("click", () => {
    window.location.replace("sub.html");
  });

  circles.forEach(circle => {
    const tooltip = circle.querySelector(".tooltip");
    const input = circle.querySelector(".tooltip-input");
    const button = circle.querySelector(".tooltip-btn");
    const unitLabel = circle.querySelector(".circleAl");

    const unit = unitLabel?.textContent.trim() || "";
    const circleItem = circle.closest(".circleItem");
    const unitName = circleItem?.querySelector(".circleName")?.textContent.trim() || "";

    // 첫 번째 값 입력 처리
    button?.addEventListener("click", async () => {
      const value = input.value.trim();
      if (!value) return;

      firstUnit = unit;
      firstValue = value;
      firstUnitName = unitName;

      tooltip.classList.remove("active");
      activeTooltip = null;

      // id 변환
      const unitId = unitIdMap[firstUnitName];

      if (!unitId) {
        expBox.innerHTML = `<div>해당 단위 설명 데이터가 없습니다.</div>`;
        return;
      }

      try {
        const data = await getUnitInfo(unitId);

        expBox.innerHTML = `
          <div style="padding:20px; font-size:20px;">
            <h2><b>${data.name}</b> 단위 설명</h2>
            <div style="margin-top:10px; font-size:18px;">
              <b>기호:</b> ${data.symbol}<br>
              <b>배율:</b> ${data.magnification}<br><br>
              <div style="white-space:pre-line;">${data.desc}</div>
            </div>
          </div>
        `;

      } catch (e) {
        expBox.innerHTML = `<div>설명 데이터를 불러올 수 없습니다.</div>`;
      }
    });

    // 두 번째 클릭
    circle.addEventListener("click", (e) => {
      e.stopPropagation();

      if (!firstUnit) {
        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.classList.remove("active");
        }
        tooltip.classList.add("active");
        input.focus();
        activeTooltip = tooltip;
        return;
      }

      if (unit === firstUnit) return;

      resultContent.innerHTML = `
        <div style="padding:20px; font-size:20px;">
          <b>${firstUnitName}</b> → <b>${unitName}</b> 변환 요청됨<br><br>
          <div style="font-size:18px; line-height: 1.5;">
            계산 결과.<br>
            계산 과정.
          </div>
        </div>
      `;
    });
  });

  // 팝업 외부 클릭 시 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".tooltip") && !e.target.closest(".circle")) {
      if (activeTooltip) {
        activeTooltip.classList.remove("active");
        activeTooltip = null;
      }
    }
  });

  // 초기화 버튼
  resetBtn.addEventListener("click", () => {
    firstUnit = null;
    firstValue = null;
    firstUnitName = null;

    expBox.innerHTML = "";
    resultContent.innerHTML = "";

    circles.forEach(circle => {
      const input = circle.querySelector(".tooltip-input");
      if (input) input.value = "";
    });
  });
});
