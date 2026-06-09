const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

let selectedFile = null;

imageInput.addEventListener("change", (e) => {

  selectedFile = e.target.files[0];

  if (!selectedFile) return;

  preview.src = URL.createObjectURL(selectedFile);
  preview.style.display = "block";
});

document.getElementById("analyzeBtn").addEventListener("click", async () => {

  if (!selectedFile) {
    alert("اختر صورة أولاً");
    return;
  }

  loading.classList.remove("hidden");
  result.innerHTML = "";

  const reader = new FileReader();

  reader.onload = async () => {

    try {

      const imageBase64 = reader.result.split(",")[1];

      const response = await fetch(
        "http://localhost:3000/analyze-food",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageBase64
          })
        }
      );

      const data = await response.json();

      loading.classList.add("hidden");

      result.innerHTML = `
        <div class="card">
          <div class="card-title">🍽️ الطعام</div>
          <div class="card-value">${data.food}</div>
        </div>

        <div class="card">
          <div class="card-title">🔥 السعرات</div>
          <div class="card-value">${data.calories} kcal</div>
        </div>

        <div class="card">
          <div class="card-title">💪 البروتين</div>
          <div class="card-value">${data.protein} g</div>
        </div>

        <div class="card">
          <div class="card-title">🍞 الكربوهيدرات</div>
          <div class="card-value">${data.carbs} g</div>
        </div>

        <div class="card">
          <div class="card-title">🥑 الدهون</div>
          <div class="card-value">${data.fat} g</div>
        </div>
      `;

    } catch (error) {

      loading.classList.add("hidden");

      result.innerHTML = `
      <div class="card">
        ❌ فشل تحليل الصورة
      </div>
      `;

      console.error(error);
    }
  };

  reader.readAsDataURL(selectedFile);
});