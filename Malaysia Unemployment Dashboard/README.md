> **Author's Note:** This project was developed to practice and demonstrate skills in data acquisition, cleaning, and visualization using real Malaysian data.


# Malaysia Unemployment Dashboard 🇲🇾

This project helps you acquire and clean Malaysia's unemployment data from the Department of Statistics Malaysia (DOSM) using the OpenDOSM API. The cleaned data is ready for analysis in Power BI. I have already analyzed the data in Power BI and will add dashboard screenshots soon.


## Project Overview

This project downloads and cleans Malaysia's unemployment datasets. The data is organized so you can easily use it in Power BI for charts and dashboards. All data comes from DOSM's OpenDOSM API and covers monthly, quarterly, and annual reports.


## Main Features

- Automatic data download from DOSM
- Monthly, quarterly, and annual datasets
- Data cleaning and organization
- Simple code structure (download and cleaning are separate)
- Cleaned CSV files ready for Power BI


## Project Structure

```
Malaysia Unemployment Dashboard/
├── main.py         # Runs the whole process (download + clean)
├── download.py     # Downloads data from OpenDOSM API
├── cleaning.py     # Cleans and organizes the data
├── README.md       # Project info
├── virt/           # Python virtual environment
├── Dataset/
│   ├── Monthly/
│   │   ├── Raw/      # Downloaded data
│   │   └── Cleaned/  # Cleaned data for Power BI
│   ├── Quarterly/
│   │   ├── Raw/
│   │   └── Cleaned/
│   └── Annual/
│       ├── Raw/
│       └── Cleaned/
├── Malaysia Unemployment Dashboard.pbix   # Power BI dashboard file (to be added)
└── dashboard_screenshots/                # Dashboard screenshots (to be added)
```


## How to Use
1. **Download and clean the data**
   ```powershell
   python main.py
   ```
   - This will create folders, download all datasets, clean the data, and give you a summary.
2. **Analyze in Power BI**
   - Open Power BI Desktop
   - Import the cleaned CSV files from `Dataset/*/Cleaned/`
   - Make your own charts and dashboards
   - I have already done this and will add screenshots and the PBIX file soon.


## Dashboard Highlights

- Cleaned data for making charts and graphs
- Regional and demographic breakdowns
- Easy to compare trends
- Exportable reports
- Real-time data refresh (just run the pipeline again)
- Power BI dashboard and screenshots (coming soon)


**Last Updated**: August 2025  
**Data Currency**: Real-time (per DOSM updates)  
**Project Status**: Active Development
**Status**: Data pipeline and Power BI dashboard completed. Dashboard files and screenshots will be added soon.
---


*This project is part of my personal portfolio, showing my ability to work with real data and create useful visualizations.*
