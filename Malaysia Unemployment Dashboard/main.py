"""
Malaysia Unemployment Dashboard - Main Script
This script orchestrates the data download and cleaning process for the unemployment dashboard.
"""

from download import main as download_data
from cleaning import clean_all_datasets


def main():
    """
    Main function to run the complete data pipeline:
    1. Download unemployment data from OpenDOSM API
    2. Clean and process the downloaded data
    """
    print("MALAYSIA UNEMPLOYMENT DASHBOARD - DATA PIPELINE")
    print("=" * 80)
    
    # Step 1: Download data
    print("STEP 1: DOWNLOADING DATA")
    print("-" * 40)
    downloaded_data, failed_downloads = download_data()
    
    # Step 2: Clean data (only if downloads were successful)
    if downloaded_data:
        print("\n" + "=" * 80)
        print("STEP 2: CLEANING DATA")
        print("-" * 40)
        cleaned_data = clean_all_datasets()
        
        # Final summary
        print("\n" + "=" * 80)
        print("PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 80)
        print(f"✓ Downloaded {len(downloaded_data)} datasets")
        print(f"✓ Cleaned {len(cleaned_data)} datasets")
        print("✓ Data is ready for dashboard creation and analysis")
        
        if failed_downloads:
            print(f"\n⚠ Note: {len(failed_downloads)} datasets failed to download")
    else:
        print("\n❌ No data was downloaded successfully. Skipping cleaning step.")
        print("Please check your internet connection and API availability.")


if __name__ == "__main__":
    main()
