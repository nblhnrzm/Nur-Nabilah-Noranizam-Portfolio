import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pycountry_convert as pc
import pycountry

df = pd.read_csv("unemployment_clean_data.csv")

#Dataset Overview / Basic Info
print(f"Data loaded successfully! \nDataset Shape: {df.shape}")
print(f"\n\nPreview:\n{df.head()}")
print(f"\n\nMissing Values:\n{df.isnull().sum()}")

print(f"\n\nQuick Statistics: \n{df["Unemployment_Rate"].describe()}")

# Define continent groupings based on country codes (more reliable than names)
def get_country_continent(country_name, country_code):
    # Special case for Timor-Leste (TL code not supported by pycountry_convert)
    if country_code == 'TLS':  # Timor-Leste
        return 'Asia'
    
    try:
        # First try using the country code directly (Alpha-3 to Alpha-2 conversion)
        country_obj = pycountry.countries.get(alpha_3=country_code)
        if country_obj:
            alpha2_code = country_obj.alpha_2
            continent_code = pc.country_alpha2_to_continent_code(alpha2_code)
            continent_name = pc.convert_continent_code_to_continent_name(continent_code)
            return continent_name
    except:
        pass
    
    # Fallback to country name approach with mappings
    country_mappings = {
        'Turkiye': 'Turkey',
        'Yemen, Rep.': 'Yemen',
        'Virgin Islands (U.S.)': 'Virgin Islands, U.S.',
        'Puerto Rico (US)': 'Puerto Rico',
        'Korea, Rep.': 'South Korea',
        'Korea, Dem. People\'s Rep.': 'North Korea',
        'Iran, Islamic Rep.': 'Iran',
        'Venezuela, RB': 'Venezuela',
        'Russian Federation': 'Russia',
        'Egypt, Arab Rep.': 'Egypt'
    }
    
    mapped_name = country_mappings.get(country_name, country_name)
    
    try:
        country_code_alpha2 = pc.country_name_to_country_alpha2(mapped_name)
        continent_code = pc.country_alpha2_to_continent_code(country_code_alpha2)
        continent_name = pc.convert_continent_code_to_continent_name(continent_code)
        return continent_name
    except:
        return "Regional/Economic Groupings"  # Catch-all for non-country entries

def get_continent_countries():
    # Get unique countries with their codes
    unique_countries = df[['Country Name', 'Country Code']].drop_duplicates()
    
    continents = {}
    
    # Automatically categorize ALL countries/regions using country codes
    for _, row in unique_countries.iterrows():
        country_name = row['Country Name']
        country_code = row['Country Code']
        continent = get_country_continent(country_name, country_code)
        if continent not in continents:
            continents[continent] = []
        continents[continent].append(country_name)
    
    # Sort countries within each continent/grouping
    for continent in continents:
        continents[continent] = sorted(continents[continent])
    
    return continents

continents = get_continent_countries()

# Main selection loop
while True:
    # Show available continents
    print(f"\n\nSelect which category/country to analyze:")
    for i, (continent_name, countries) in enumerate(continents.items(), 1):
        print(f"{i}. {continent_name} ({len(countries)} countries)")

    # User input for continent selection - keep asking until valid
    selected_continent = None
    while selected_continent is None:
        selected_input = input(f"\nEnter number (1-{len(continents)}) or region name: ").strip()
        
        if not selected_input:
            print("Please enter a valid selection.")
            continue
        
        # Check if input is a number
        if selected_input.isdigit():
            continent_num = int(selected_input)
            if 1 <= continent_num <= len(continents):
                selected_continent = list(continents.keys())[continent_num - 1]
            else:
                print(f"Invalid number. Please enter a number between 1 and {len(continents)}.")
        else:
            # Try to match continent name
            for continent_name in continents.keys():
                if selected_input.lower() in continent_name.lower():
                    selected_continent = continent_name
                    break
            
            if selected_continent is None:
                print("Region not found. Please try again.")
                print("Available options:")
                for i, (continent_name, countries) in enumerate(continents.items(), 1):
                    print(f"{i}. {continent_name}")

    # Process user selection
    continent_countries = continents[selected_continent]
    if not continent_countries:
        print(f"No countries found for {selected_continent}. Showing global average.")
        df_plot = df.groupby("Year")["Unemployment_Rate"].mean().reset_index()
        df_plot["Country Name"] = "Global Average"
        chart_title = "Global Average Unemployment Rate Over Time"
        filename = "unemployment_trend_global.png"
        break  # Exit the main loop to generate chart
    else:
        # Show countries in selected continent
        print(f"\nCountries/Entities in {selected_continent}:")
        for i, country in enumerate(continent_countries, 1):
            print(f"{i}. {country}")
        print("0. Go back to main category selection")
        
        # Let user select a specific country
        selected_country = None
        while selected_country is None:
            country_choice = input(f"\nEnter number (0 to go back, 1-{len(continent_countries)}) or entity name: ").strip()
            
            if not country_choice:
                print("Please enter a valid selection.")
                continue
                
            if country_choice.isdigit():
                choice_num = int(country_choice)
                if choice_num == 0:
                    # Go back to main category selection
                    print("\nGoing back to main category selection...")
                    selected_continent = None
                    break
                elif 1 <= choice_num <= len(continent_countries):
                    selected_country = continent_countries[choice_num - 1]
                else:
                    print(f"Invalid number. Please enter 0 to go back or a number between 1 and {len(continent_countries)}.")
            else:
                # Try to match by name (exact or partial match)
                matches = [c for c in continent_countries if country_choice.lower() in c.lower()]
                if len(matches) == 1:
                    selected_country = matches[0]
                elif len(matches) > 1:
                    print(f"Multiple matches found for '{country_choice}'. Please be more specific:")
                    for i, match in enumerate(matches, 1):
                        print(f"  {i}. {match}")
                    print("Or enter the exact number from the original list, or 0 to go back.")
                else:
                    print(f"Entity '{country_choice}' not found. Please try again.")
                    print("Available entities:")
                    for i, country in enumerate(continent_countries, 1):
                        print(f"{i}. {country}")
                    print("0. Go back to main category selection")
        
        # If user went back (selected_continent became None), continue the main loop
        if selected_continent is None:
            continue
            
        # Filter data for selected country
        df_plot = df[df["Country Name"] == selected_country]
        if df_plot.empty:
            print(f"No data found for '{selected_country}'. Showing global average instead.")
            df_plot = df.groupby("Year")["Unemployment_Rate"].mean().reset_index()
            df_plot["Country Name"] = "Global Average"
            chart_title = "Global Average Unemployment Rate Over Time"
            filename = "unemployment_trend_global.png"
        else:
            chart_title = f"Unemployment Rate Over Time - {selected_country}"
            filename = f"unemployment_trend_{selected_country.replace(' ', '_').replace(',', '').replace('.', '')}.png"
        
        break  # Exit the main loop to generate chart


#Line Chart of unemployment over time
plt.figure(figsize=(12, 6))
sns.lineplot(data=df_plot, x="Year", y="Unemployment_Rate", marker="o")
plt.title(chart_title)
plt.xlabel("Year")
plt.ylabel("Unemployment Rate (%)")
plt.grid(True)
plt.savefig(filename, dpi=300)
plt.show()