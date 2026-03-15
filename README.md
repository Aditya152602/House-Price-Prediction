# 🏠 House · Price · Prediction

**AI-Powered Real Estate Intelligence for Indian Markets**

> Developer: **Aditya Dwivedi**  
> Stack: Python · Flask · ML Model · Chart.js · CSS3

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Prediction** | ML model with 15+ city multipliers, 8 property types, condition factors |
| ⚖️ **Property Comparison** | Side-by-side comparison of two properties with winner recommendation |
| 💳 **EMI Calculator** | Full loan breakdown with pie chart visualization |
| 📈 **Market Dashboard** | 12-month trend charts + city comparison bars |
| 🏘️ **Neighborhood Insights** | Demand/supply index, rental yield, appreciation rate |
| 💡 **Price Breakdown** | Visual bar chart showing price contribution of each factor |
| 🎯 **Investment Score** | 0-100 score ring for investment attractiveness |
| 🎨 **Luxury Dark UI** | Noir Gold theme, particles, cursor glow, smooth animations |

---

## 🚀 Setup & Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py

# Open in browser
http://localhost:5000
```

---

## 📁 Project Structure

```
house-price-prediction/
├── app.py                  # Flask backend + ML engine
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main UI template
└── static/
    ├── css/
    │   └── style.css       # Luxury Dark theme
    └── js/
        └── app.js          # Frontend logic + Chart.js
```

---

## 🧠 How the ML Model Works

The prediction engine uses a weighted linear regression simulation:

- **Base price** + area × ₹45/sqft
- **Room multipliers** (bedrooms, bathrooms, floors)
- **Location multiplier** (1.1× Lakhimpur → 3.2× Mumbai)
- **Property type multiplier** (0.75× Studio → 2.2× Penthouse)
- **Condition factor** (0.8× Poor → 1.25× Excellent)
- **Amenity bonuses** (Pool +₹1.5L, Furnished +₹2L, etc.)
- **Confidence range** ± 8% with dynamic confidence score

---

*© 2025 House · Price · Prediction · Developed by Aditya Dwivedi*
