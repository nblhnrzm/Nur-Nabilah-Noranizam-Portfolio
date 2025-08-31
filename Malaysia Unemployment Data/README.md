> **Author's Note:** This project was developed to practice and demonstrate skills in data acquisition and cleaning using real Malaysian data.


# Malaysia Unemployment Data Pipeline 🇲🇾

This project automatically downloads and cleans Malaysia's unemployment data from the Department of Statistics Malaysia (DOSM) using the OpenDOSM API. The pipeline provides clean, organized CSV files for further use.


## Project Overview

This project automatically downloads and cleans Malaysia's unemployment datasets from DOSM's OpenDOSM API. The data covers monthly, quarterly, and annual reports and is organized into clean CSV files for easy access and further processing.


## Main Features

- Automatic data download from DOSM OpenDOSM API
- Monthly, quarterly, and annual datasets
- Data cleaning and standardization
- Simple, modular code structure (download and cleaning are separate)
- Organized output in clean CSV format


## Project Structure

```
Malaysia Unemployment Data/
├── main.py         # Runs the whole process (download + clean)
├── download.py     # Downloads data from OpenDOSM API
├── cleaning.py     # Cleans and organizes the data
├── README.md       # Project documentation
├── requirements.txt # Python dependencies
├── virt/           # Python virtual environment
└── Dataset/
    ├── Monthly/
    │   ├── Raw/      # Downloaded raw data
    │   └── Cleaned/  # Processed clean data
    ├── Quarterly/
    │   ├── Raw/
    │   └── Cleaned/
    └── Annual/
        ├── Raw/
        └── Cleaned/
```


## How to Use

### Prerequisites
- Python 3.7 or newer
- Internet connection (required for data download)

### Setup Instructions
1. **Clone or download the repository**
   ```bash
   git clone https://github.com/nblhnrzm/Nur-Nabilah-Noranizam-Portfolio.git
   cd "Nur-Nabilah-Noranizam-Portfolio/Malaysia Unemployment Data"
   ```

2. **Create and activate virtual environment**
   ```bash
   # Create virtual environment
   python -m venv virt
   
   # Activate virtual environment
   # For Windows:
   virt\Scripts\activate
   # For Mac/Linux:
   source virt/bin/activate
   ```

3. **Install required packages**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Project
1. **Download and clean the data**
   ```bash
   python main.py
   ```
   - This will create the necessary folders, download all datasets from DOSM, clean and standardize the data, and provide a summary of the process.

2. **Output**
   - Clean, organized CSV files will be available in `Dataset/*/Cleaned/` directories
   - Data is ready for further processing or analysis as needed


## Output Features

- Clean CSV files organized by frequency (monthly, quarterly, annual)
- Standardized column names and data formats
- Regional and demographic data breakdowns
- Easy-to-access file structure
- Automated data refresh capability (simply re-run the pipeline)


**Last Updated**: September 2025  
**Data Currency**: Real-time (per DOSM updates)  
**Project Status**: Complete - Data Pipeline Operational

---

*This project is part of my personal portfolio, demonstrating my ability to work with real-world APIs and implement automated data processing pipelines.*
