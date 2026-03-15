"""
House Price Prediction - Flask Application
Developer: Aditya Dwivedi
"""

from flask import Flask, render_template, request, jsonify
import numpy as np
import json
import math

app = Flask(__name__)

# ─── Synthetic ML Model (no sklearn needed) ───────────────────────────────────
# Coefficients derived from a simplified linear regression simulation
BASE_PRICE = 20000  # base price in ₹ thousands

WEIGHTS = {
    "area_sqft":      45.0,     # ₹ per sqft
    "bedrooms":       180000,   # per bedroom
    "bathrooms":      120000,   # per bathroom
    "floors":         80000,    # per floor
    "age_years":     -15000,    # depreciation
    "garage":         90000,    # garage bonus
    "pool":           150000,   # pool bonus
    "garden":         60000,    # garden bonus
    "furnished":      200000,   # furnished bonus
    "solar":          75000,    # solar panels bonus
    "security":       50000,    # security system
    "gym":            100000,   # gym bonus
}

LOCATION_MULTIPLIERS = {
    "Delhi":       2.8,
    "Mumbai":      3.2,
    "Bangalore":   2.5,
    "Hyderabad":   2.1,
    "Chennai":     2.0,
    "Pune":        1.9,
    "Kolkata":     1.7,
    "Ahmedabad":   1.6,
    "Jaipur":      1.4,
    "Lucknow":     1.3,
    "Lakhimpur":   1.1,
    "Noida":       2.3,
    "Gurgaon":     2.6,
    "Chandigarh":  1.8,
    "Indore":      1.5,
}

PROPERTY_TYPE_MULT = {
    "Apartment":    1.0,
    "Villa":        1.6,
    "Independent":  1.3,
    "Penthouse":    2.2,
    "Studio":       0.75,
    "Duplex":       1.45,
    "Farmhouse":    1.8,
    "Row House":    1.1,
}

CONDITION_MULT = {
    "Excellent":  1.25,
    "Good":       1.10,
    "Average":    1.00,
    "Poor":       0.80,
    "Under Construction": 0.90,
}

def predict_price(data):
    """Core prediction engine with noise simulation."""
    area    = float(data.get("area_sqft", 1000))
    beds    = int(data.get("bedrooms", 2))
    baths   = int(data.get("bathrooms", 1))
    floors  = int(data.get("floors", 1))
    age     = int(data.get("age_years", 5))
    city    = data.get("city", "Lucknow")
    p_type  = data.get("property_type", "Apartment")
    cond    = data.get("condition", "Good")

    # Amenities (booleans)
    amenities = {
        "garage":    bool(data.get("garage", False)),
        "pool":      bool(data.get("pool", False)),
        "garden":    bool(data.get("garden", False)),
        "furnished": bool(data.get("furnished", False)),
        "solar":     bool(data.get("solar", False)),
        "security":  bool(data.get("security", False)),
        "gym":       bool(data.get("gym", False)),
    }

    # Base calculation
    price = BASE_PRICE
    price += area * WEIGHTS["area_sqft"]
    price += beds * WEIGHTS["bedrooms"]
    price += baths * WEIGHTS["bathrooms"]
    price += floors * WEIGHTS["floors"]
    price += age * WEIGHTS["age_years"]

    for amenity, present in amenities.items():
        if present:
            price += WEIGHTS[amenity]

    # Apply multipliers
    location_mult = LOCATION_MULTIPLIERS.get(city, 1.2)
    type_mult     = PROPERTY_TYPE_MULT.get(p_type, 1.0)
    cond_mult     = CONDITION_MULT.get(cond, 1.0)

    price = max(price, 500000)  # floor price
    price *= location_mult * type_mult * cond_mult

    # Confidence & range
    confidence = min(95, 70 + (area / 500) * 5 + beds * 2)
    confidence = round(min(confidence, 95), 1)

    margin = 0.08
    low  = price * (1 - margin)
    high = price * (1 + margin)

    # Per sqft
    per_sqft = price / area if area > 0 else 0

    # Score (0-100) for investment attractiveness
    score = 50
    score += min(20, (area - 500) / 100)
    score += (5 - age / 10) * 2
    score += len([a for a in amenities.values() if a]) * 3
    score = max(0, min(100, round(score)))

    return {
        "predicted_price": round(price),
        "price_low":        round(low),
        "price_high":       round(high),
        "per_sqft":         round(per_sqft),
        "confidence":       confidence,
        "investment_score": score,
        "location_mult":    location_mult,
        "breakdown": {
            "base":      round(BASE_PRICE + area * WEIGHTS["area_sqft"]),
            "bedrooms":  round(beds * WEIGHTS["bedrooms"]),
            "bathrooms": round(baths * WEIGHTS["bathrooms"]),
            "amenities": round(sum(WEIGHTS[k] for k, v in amenities.items() if v)),
            "location_factor": round((location_mult - 1) * 100, 1),
        }
    }

def get_market_trends(city):
    """Simulate 12-month market trend data."""
    base = LOCATION_MULTIPLIERS.get(city, 1.2) * 5000
    months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"]
    trend = []
    val = base
    for i, m in enumerate(months):
        noise = math.sin(i * 0.6) * 300 + (i * 80)
        val = base + noise
        trend.append({"month": m, "price": round(val)})
    return trend

def get_neighborhood_stats(city):
    """Return neighborhood comparison stats."""
    mult = LOCATION_MULTIPLIERS.get(city, 1.2)
    return {
        "avg_price":    round(mult * 4500000),
        "appreciation": round((mult - 1) * 8 + 4, 1),
        "demand_index": round(mult * 30),
        "supply_index": round(40 - mult * 5),
        "rental_yield": round(3 + mult * 0.8, 1),
    }

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    cities      = sorted(LOCATION_MULTIPLIERS.keys())
    prop_types  = sorted(PROPERTY_TYPE_MULT.keys())
    conditions  = list(CONDITION_MULT.keys())
    return render_template("index.html",
        cities=cities, prop_types=prop_types, conditions=conditions)

@app.route("/predict", methods=["POST"])
def predict():
    data   = request.json
    result = predict_price(data)
    city   = data.get("city", "Lucknow")
    result["trends"]      = get_market_trends(city)
    result["neighborhood"] = get_neighborhood_stats(city)
    return jsonify(result)

@app.route("/compare", methods=["POST"])
def compare():
    """Compare two properties side-by-side."""
    data    = request.json
    prop1   = predict_price(data.get("property1", {}))
    prop2   = predict_price(data.get("property2", {}))
    return jsonify({"property1": prop1, "property2": prop2})

@app.route("/emi", methods=["POST"])
def calculate_emi():
    """EMI calculator endpoint."""
    data     = request.json
    price    = float(data.get("price", 5000000))
    down     = float(data.get("down_payment_pct", 20)) / 100
    rate     = float(data.get("interest_rate", 8.5)) / 100 / 12
    tenure   = int(data.get("tenure_years", 20)) * 12

    loan = price * (1 - down)
    if rate == 0:
        emi = loan / tenure
    else:
        emi = loan * rate * (1 + rate)**tenure / ((1 + rate)**tenure - 1)

    total_payment = emi * tenure
    total_interest = total_payment - loan

    return jsonify({
        "emi":            round(emi),
        "loan_amount":    round(loan),
        "total_payment":  round(total_payment),
        "total_interest": round(total_interest),
        "down_payment":   round(price * down),
    })
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)