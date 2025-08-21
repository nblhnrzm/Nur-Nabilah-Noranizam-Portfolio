import pandas as pd
import requests
import datetime
import os
import time


def download_dosm_data(dataset_id, dataset_name):
    """Download data from OpenDOSM API"""
    try:
        url = f"https://api.data.gov.my/opendosm?id={dataset_id}"
        print(f"Downloading {dataset_name}")
        print(f"URL {url}")
        
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            # OpenDOSM API returns data directly as a list, not wrapped in a 'data' field
            df = pd.DataFrame(data)
            print(f"✓ Successfully downloaded {dataset_name}")
            print(f"  Shape: {df.shape}")
            print(f"  Columns: {list(df.columns)[:5]}{'...' if len(df.columns) > 5 else ''}")
            return df
        else:
            print(f"✗ Failed to download {dataset_name}: HTTP {response.status_code}")
            return None
            
    except Exception as e:
        print(f"✗ Error downloading {dataset_name}: {str(e)}")
        return None


def main():
    # Create main dataset folder
    dataset_folder = "Dataset"
    if not os.path.exists(dataset_folder):
        os.makedirs(dataset_folder)
        print(f"Created the folder {dataset_folder}")

    # Create subfolders for each frequency, each with a 'Raw' folder
    frequencies = ["Monthly", "Quarterly", "Annual"]
    for freq in frequencies:
        freq_path = os.path.join(dataset_folder, freq)
        raw_path = os.path.join(freq_path, "Raw")
        if not os.path.exists(raw_path):
            os.makedirs(raw_path)
            print(f"Created subfolder {raw_path}")

    # Define all unemployment-related datasets from OpenDOSM
    unemployment_datasets = {
        # Monthly Data
        "monthly_lfs": {
            "id": "lfs_month",
            "name": "Monthly Principal Labour Force Statistics",
            "frequency": "Monthly"
        },
        "monthly_lfs_sa": {
            "id": "lfs_month_sa", 
            "name": "Monthly Labour Force Statistics (Seasonally Adjusted)",
            "frequency": "Monthly"
        },
        "monthly_employment_status": {
            "id": "lfs_month_status",
            "name": "Monthly Employment by Status",
            "frequency": "Monthly"
        },
        "monthly_unemployment_duration": {
            "id": "lfs_month_duration",
            "name": "Monthly Unemployment by Duration", 
            "frequency": "Monthly"
        },
        "monthly_youth_unemployment": {
            "id": "lfs_month_youth",
            "name": "Monthly Youth Unemployment (15-30 age group)",
            "frequency": "Monthly"
        },
        
        # Quarterly Data
        "quarterly_lfs": {
            "id": "lfs_qtr",
            "name": "Quarterly Principal Labour Force Statistics",
            "frequency": "Quarterly"
        },
        "quarterly_lfs_state": {
            "id": "lfs_qtr_state",
            "name": "Quarterly Labour Force Statistics by State",
            "frequency": "Quarterly"
        },
        "quarterly_skills_underemployment_age": {
            "id": "lfs_qtr_sru_age",
            "name": "Quarterly Skills-Related Underemployment by Age",
            "frequency": "Quarterly"
        },
        "quarterly_skills_underemployment_sex": {
            "id": "lfs_qtr_sru_sex", 
            "name": "Quarterly Skills-Related Underemployment by Sex",
            "frequency": "Quarterly"
        },
        "quarterly_time_underemployment_age": {
            "id": "lfs_qtr_tru_age",
            "name": "Quarterly Time-Related Underemployment by Age",
            "frequency": "Quarterly"
        },
        "quarterly_time_underemployment_sex": {
            "id": "lfs_qtr_tru_sex",
            "name": "Quarterly Time-Related Underemployment by Sex", 
            "frequency": "Quarterly"
        },
        
        # Annual Data
        "annual_lfs": {
            "id": "lfs_year",
            "name": "Annual Principal Labour Force Statistics",
            "frequency": "Annual"
        },
        "annual_lfs_sex": {
            "id": "lfs_year_sex",
            "name": "Annual Labour Force Statistics by Sex",
            "frequency": "Annual"
        },
        "annual_lfs_state_sex": {
            "id": "lfs_state_sex",
            "name": "Annual Labour Force Statistics by State & Sex",
            "frequency": "Annual"
        },
        "annual_lfs_district": {
            "id": "lfs_district",
            "name": "Annual Labour Force Statistics by District",
            "frequency": "Annual"
        },
        "annual_employment_sector": {
            "id": "employment_sector",
            "name": "Employment by MSIC Sector and Sex",
            "frequency": "Annual"
        }
    }

    # Download all unemployment datasets
    print("Starting download of all Malaysia unemployment datasets from OpenDOSM API...")
    print("=" * 80)

    downloaded_data = {}
    failed_downloads = []

    for key, dataset_info in unemployment_datasets.items():
        dataset_id = dataset_info["id"]
        dataset_name = dataset_info["name"]
        frequency = dataset_info["frequency"]

        # Download the data
        df = download_dosm_data(dataset_id, dataset_name)

        if df is not None:
            # Save raw data in frequency/Raw folder
            raw_filename = f"{key}_raw.csv"
            raw_folder = os.path.join(dataset_folder, frequency, "Raw")
            raw_filepath = os.path.join(raw_folder, raw_filename)
            df.to_csv(raw_filepath, index=False)

            downloaded_data[key] = {
                'data': df,
                'info': dataset_info,
                'raw_path': raw_filepath
            }
            print(f"  Saved to: {raw_filepath}")
        else:
            failed_downloads.append((key, dataset_info))

        print("-" * 40)
        time.sleep(1)

    # Create summary report
    print("\n" + "=" * 80)
    print("DOWNLOAD SUMMARY REPORT")
    print("=" * 80)

    print(f"Total datasets attempted: {len(unemployment_datasets)}")
    print(f"Successfully downloaded: {len(downloaded_data)}")
    print(f"Failed downloads: {len(failed_downloads)}")

    print(f"\nDatasets organized in folder: {dataset_folder}")
    print("Folder structure:")
    for freq in frequencies:
        print(f"├── {freq}/")
        print(f"    └── Raw/   (Raw datasets for {freq.lower()} frequency)")

    if downloaded_data:
        print(f"\nSuccessfully downloaded datasets:")
        for key, info in downloaded_data.items():
            print(f"  ✓ {info['info']['name']} ({info['info']['frequency']})")

    if failed_downloads:
        print(f"\nFailed downloads:")
        for key, info in failed_downloads:
            print(f"  ✗ {info['name']} ({info['frequency']})")

    print(f"\nAll Malaysia unemployment data is now organized and ready for analysis!")
    print("You can now use these datasets for your dashboard and visualizations.")

    return downloaded_data, failed_downloads


if __name__ == "__main__":
    main()
