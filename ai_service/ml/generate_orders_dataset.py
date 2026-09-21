import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# List of Al Viro's 10 authentic dishes with base daily demand weights
DISHES = [
    {"name": "Margherita Classica", "category": "Pizza", "price": 18.50, "base_demand": 32},
    {"name": "Truffle Risotto", "category": "Main", "price": 28.00, "base_demand": 24},
    {"name": "Lobster Ravioli", "category": "Pasta", "price": 32.00, "base_demand": 20},
    {"name": "Osso Buco alla Milanese", "category": "Main", "price": 36.00, "base_demand": 18},
    {"name": "Penne all'Arrabbiata", "category": "Pasta", "price": 19.00, "base_demand": 22},
    {"name": "Bruschetta al Pomodoro", "category": "Appetizer", "price": 12.00, "base_demand": 26},
    {"name": "Classic Tiramisu", "category": "Dessert", "price": 11.50, "base_demand": 28},
    {"name": "Fettuccine Alfredo con Pollo", "category": "Pasta", "price": 24.50, "base_demand": 21},
    {"name": "Diavola Pizza", "category": "Pizza", "price": 21.00, "base_demand": 25},
    {"name": "Burrata Pugliese Salad", "category": "Appetizer", "price": 16.00, "base_demand": 19},
]

WEATHER_CONDITIONS = ["Sunny", "Rainy", "Cloudy", "Chilly"]
HOLIDAY_DATES = ["01-01", "02-14", "07-04", "10-31", "11-26", "12-24", "12-25", "12-31"]

def generate_orders_dataset(output_path: str = None, days: int = 365):
    if output_path is None:
        output_path = os.path.join(os.path.dirname(__file__), "..", "data", "orders_dataset.csv")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    start_date = datetime(2025, 1, 1)
    records = []

    np.random.seed(42)
    random.seed(42)

    for d in range(days):
        current_date = start_date + timedelta(days=d)
        date_str = current_date.strftime("%Y-%m-%d")
        month_day_str = current_date.strftime("%m-%d")
        day_of_week = current_date.weekday() # 0 = Mon, 6 = Sun
        is_weekend = 1 if day_of_week in [4, 5, 6] else 0 # Fri, Sat, Sun
        is_holiday = 1 if month_day_str in HOLIDAY_DATES else 0

        # Seasonal temperature and weather
        month = current_date.month
        if month in [12, 1, 2]:
            weather = random.choices(WEATHER_CONDITIONS, weights=[0.2, 0.3, 0.2, 0.3])[0]
            temperature = round(random.uniform(2.0, 12.0), 1)
        elif month in [6, 7, 8]:
            weather = random.choices(WEATHER_CONDITIONS, weights=[0.6, 0.1, 0.2, 0.1])[0]
            temperature = round(random.uniform(22.0, 34.0), 1)
        else:
            weather = random.choices(WEATHER_CONDITIONS, weights=[0.4, 0.2, 0.3, 0.1])[0]
            temperature = round(random.uniform(14.0, 24.0), 1)

        # Generate orders count for each dish on this date
        for dish in DISHES:
            base = dish["base_demand"]

            # Multiplier rules
            multiplier = 1.0

            # 1. Weekend surge (+25% to +45%)
            if is_weekend:
                multiplier += random.uniform(0.25, 0.45)

            # 2. Holiday surge (+30%)
            if is_holiday:
                multiplier += random.uniform(0.30, 0.50)

            # 3. Weather impact
            if weather in ["Rainy", "Chilly"]:
                if dish["category"] in ["Main", "Pasta"]:
                    multiplier += 0.20 # Warm comfort food boost
                elif dish["category"] == "Appetizer" and "Salad" in dish["name"]:
                    multiplier -= 0.15 # Cold salads decrease slightly
            elif weather == "Sunny":
                if "Salad" in dish["name"] or "Bruschetta" in dish["name"]:
                    multiplier += 0.20
                if "Tiramisu" in dish["name"]:
                    multiplier += 0.15

            # Apply Poisson distribution with noise
            expected_orders = max(5, int(np.random.poisson(base * multiplier)))

            records.append({
                "date": date_str,
                "month": month,
                "day_of_week": day_of_week,
                "is_weekend": is_weekend,
                "is_holiday": is_holiday,
                "weather": weather,
                "temperature": temperature,
                "dish_name": dish["name"],
                "category": dish["category"],
                "price": dish["price"],
                "orders_count": expected_orders
            })

    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"✅ Generated realistic orders dataset with {len(df)} records at {output_path}")
    return df

if __name__ == "__main__":
    generate_orders_dataset()
