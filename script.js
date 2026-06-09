let daily = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    meals: []
};

// =====================
// Load saved data safely
// =====================
try {
    const saved = localStorage.getItem("ncalorie");

    if (saved) {
        daily = JSON.parse(saved);
    }
} catch (e) {
    console.log("Reset corrupted storage");
    localStorage.removeItem("ncalorie");
}

updateUI();

// =====================
// Save data
// =====================
function saveData() {
    localStorage.setItem("ncalorie", JSON.stringify(daily));
}

// =====================
// Upload & Analyze
// =====================
document.getElementById("analyzeBtn").addEventListener("click", async () => {

    const file = document.getElementById("imageInput").files[0];

    if (!file) {
        alert("📸 اختر صورة أولاً");
        return;
    }

    document.getElementById("loading").classList.remove("hidden");

    const reader = new FileReader();

    reader.onload = async function () {

        try {
            const base64 = reader.result.split(",")[1];

            const res = await fetch("/analyze-food", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: base64 })
            });

            const data = await res.json();

            document.getElementById("loading").classList.add("hidden");

            // =====================
            // Clean values safely
            // =====================
            const calories = Number(data.calories) || 0;
            const protein = Number(data.protein) || 0;
            const carbs = Number(data.carbs) || 0;
            const fat = Number(data.fat) || 0;
            const food = data.food || "غير معروف";

            // =====================
            // Update daily stats
            // =====================
            daily.calories += calories;
            daily.protein += protein;
            daily.carbs += carbs;
            daily.fat += fat;

            // Save meal
            daily.meals.unshift({
                food,
                calories
            });

            // keep last 5 meals only
            daily.meals = daily.meals.slice(0, 5);

            saveData();
            updateUI();

        } catch (err) {
            console.error(err);
            document.getElementById("loading").classList.add("hidden");
            alert("❌ حدث خطأ أثناء التحليل");
        }
    };

    reader.readAsDataURL(file);
});

// =====================
// Reset Day (PRO feature)
// =====================
function resetDay() {
    daily = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        meals: []
    };

    saveData();
    updateUI();

    alert("🔄 تم إعادة تعيين اليوم");
}

// =====================
// Update UI
// =====================
function updateUI() {

    const result = document.getElementById("result");

    result.innerHTML = `
        <h3>🔥 إحصائيات اليوم</h3>

        <div>🔥 السعرات: <b>${daily.calories}</b> kcal</div>
        <div>💪 البروتين: <b>${daily.protein}</b> g</div>
        <div>🍞 الكارب: <b>${daily.carbs}</b> g</div>
        <div>🥑 الدهون: <b>${daily.fat}</b> g</div>

        <hr>

        <h3>🍽 آخر الوجبات</h3>

        ${
            daily.meals.length > 0
            ? daily.meals.map(m => `
                <div>• ${m.food} (${m.calories} kcal)</div>
            `).join("")
            : "<p>لا توجد وجبات بعد</p>"
        }

        <br>

        <button onclick="resetDay()" style="
            background:red;
            color:white;
            padding:10px;
            border:none;
            border-radius:8px;
            width:100%;
        ">
            🔄 إعادة تعيين اليوم
        </button>
    `;
}