import pandas as pd
import datetime

# Download unemployment data from World Bank as Excel
url = "https://api.worldbank.org/v2/en/indicator/SL.UEM.TOTL.ZS?downloadformat=excel"
df = pd.read_excel(url, sheet_name="Data", skiprows=3)

#Save the raw data as CSV file
df.to_csv("unemployment_raw_data.csv", index=False)
print("Successfully downloaded raw data!")

# Select relevant columns: Country info + years from 2000 onwards
available_years = [str(year) for year in range(2000, datetime.datetime.now().year) if str(year) in df.columns]
df = df[["Country Name", "Country Code"] + available_years]

print(f"Selected years: {available_years[0]} to {available_years[-1]}")

# Transform from wide to long format for easier analysis and visualization
df_long = df.melt(
    id_vars=["Country Name", "Country Code"], 
    var_name="Year", 
    value_name="Unemployment_Rate"
)

# Convert Year to integer and clean data
df_long["Year"] = df_long["Year"].astype(int)
df_long = df_long.dropna()  # Remove rows with missing data

# Save the cleaned long format data
df_long.to_csv("unemployment_clean_data.csv", index=False)
print("Data is cleaned and saved successfully!")

