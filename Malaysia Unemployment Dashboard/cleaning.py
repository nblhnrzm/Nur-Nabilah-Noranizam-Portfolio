import pandas as pd
import numpy as np
from datetime import datetime
import os


def clean_date_column(df, date_column='date'):
    """
    Clean and standardize date column
    """
    if date_column in df.columns:
        df[date_column] = pd.to_datetime(df[date_column])
        print(f"✓ Cleaned {date_column} column - converted to datetime")
    return df


def remove_duplicates(df):
    """
    Remove duplicate rows from dataframe
    """
    initial_rows = len(df)
    df = df.drop_duplicates()
    removed_rows = initial_rows - len(df)
    if removed_rows > 0:
        print(f"✓ Removed {removed_rows} duplicate rows")
    else:
        print("✓ No duplicate rows found")
    return df


def handle_missing_values(df, strategy='drop'):
    """
    Handle missing values in dataframe
    strategy: 'drop', 'fill_zero', 'fill_mean', 'fill_median'
    """
    initial_nulls = df.isnull().sum().sum()
    
    if initial_nulls == 0:
        print("✓ No missing values found")
        return df
    
    if strategy == 'drop':
        df = df.dropna()
        print(f"✓ Dropped rows with missing values ({initial_nulls} nulls removed)")
    elif strategy == 'fill_zero':
        df = df.fillna(0)
        print(f"✓ Filled {initial_nulls} missing values with 0")
    elif strategy == 'fill_mean':
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
        print(f"✓ Filled missing values in numeric columns with mean")
    elif strategy == 'fill_median':
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        print(f"✓ Filled missing values in numeric columns with median")
    
    return df


def standardize_column_names(df):
    """
    Standardize column names (lowercase, replace spaces with underscores)
    """
    original_columns = df.columns.tolist()
    df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('-', '_')
    
    if original_columns != df.columns.tolist():
        print("✓ Standardized column names")
    return df


def convert_data_types(df):
    """
    Convert data types for better performance and analysis
    """
    # Convert object columns that should be numeric
    for col in df.columns:
        if df[col].dtype == 'object':
            # Try to convert to numeric if possible
            try:
                df[col] = pd.to_numeric(df[col], errors='ignore')
            except:
                pass
    
    print("✓ Optimized data types")
    return df


def clean_unemployment_data(df, dataset_name=""):
    """
    Apply comprehensive cleaning to unemployment dataset
    """
    print(f"\nCleaning {dataset_name}...")
    print("-" * 50)
    
    # Initial info
    print(f"Initial shape: {df.shape}")
    
    # Apply cleaning steps
    df = remove_duplicates(df)
    df = clean_date_column(df)
    df = handle_missing_values(df, strategy='drop')
    df = standardize_column_names(df)
    df = convert_data_types(df)
    
    # Final info
    print(f"Final shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    
    return df


def clean_all_datasets(dataset_folder="Dataset"):
    """
    Clean all datasets in the Dataset folder structure
    """
    print("=" * 80)
    print("STARTING DATA CLEANING PROCESS")
    print("=" * 80)
    
    cleaned_data = {}
    frequencies = ["Monthly", "Quarterly", "Annual"]
    
    for freq in frequencies:
        raw_folder = os.path.join(dataset_folder, freq, "Raw")
        cleaned_folder = os.path.join(dataset_folder, freq, "Cleaned")
        
        # Create cleaned folder if it doesn't exist
        if not os.path.exists(cleaned_folder):
            os.makedirs(cleaned_folder)
            print(f"Created cleaned data folder: {cleaned_folder}")
        
        if os.path.exists(raw_folder):
            for filename in os.listdir(raw_folder):
                if filename.endswith('.csv'):
                    # Read raw data
                    raw_filepath = os.path.join(raw_folder, filename)
                    df = pd.read_csv(raw_filepath)
                    
                    # Clean the data
                    dataset_name = filename.replace('_raw.csv', '').replace('_', ' ').title()
                    cleaned_df = clean_unemployment_data(df, dataset_name)
                    
                    # Save cleaned data
                    cleaned_filename = filename.replace('_raw.csv', '_cleaned.csv')
                    cleaned_filepath = os.path.join(cleaned_folder, cleaned_filename)
                    cleaned_df.to_csv(cleaned_filepath, index=False)
                    
                    # Store in dictionary
                    key = filename.replace('_raw.csv', '')
                    cleaned_data[key] = {
                        'data': cleaned_df,
                        'raw_path': raw_filepath,
                        'cleaned_path': cleaned_filepath,
                        'frequency': freq
                    }
                    
                    print(f"✓ Saved cleaned data to: {cleaned_filepath}")
    
    # Summary
    print("\n" + "=" * 80)
    print("DATA CLEANING SUMMARY")
    print("=" * 80)
    print(f"Total datasets cleaned: {len(cleaned_data)}")
    
    for freq in frequencies:
        freq_count = sum(1 for item in cleaned_data.values() if item['frequency'] == freq)
        print(f"{freq} datasets: {freq_count}")
    
    print("\nCleaned data folder structure:")
    for freq in frequencies:
        print(f"├── {freq}/")
        print(f"    ├── Raw/      (Original downloaded data)")
        print(f"    └── Cleaned/  (Processed and cleaned data)")
    
    print("\nData cleaning completed successfully!")
    return cleaned_data


if __name__ == "__main__":
    clean_all_datasets()
