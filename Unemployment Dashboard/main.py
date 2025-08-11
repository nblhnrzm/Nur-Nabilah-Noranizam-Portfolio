import pandas as pd
import datetime
import os

# Create directory for unemployment dataset
dataset_folder = "Unemployment Dataset"
if not os.path.exists(dataset_folder):
    os.makedirs(dataset_folder)
    print(f"Created folder: {dataset_folder}")

# Download unemployment data from World Bank as Excel
url = "https://api.worldbank.org/v2/en/indicator/SL.UEM.TOTL.ZS?downloadformat=excel"
df = pd.read_excel(url, sheet_name="Data", skiprows=3)

#Save the raw data as CSV file in the dataset folder
raw_file_path = os.path.join(dataset_folder, "unemployment_raw_data.csv")
df.to_csv(raw_file_path, index=False)
print(f"Successfully downloaded raw data to {raw_file_path} folder")

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

# Save the cleaned long format data in the dataset folder
clean_file_path = os.path.join(dataset_folder, "unemployment_clean_data.csv")
df_long.to_csv(clean_file_path, index=False)
print(f"Data is cleaned and saved successfully to {clean_file_path} folder.")

print(f"\nBoth files are now organized in the '{dataset_folder}' folder")
