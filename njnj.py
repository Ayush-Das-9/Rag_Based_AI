import pandas as pd

def csv_to_excel(csv_file, excel_file="output.xlsx"):
    df = pd.read_csv(csv_file)
    df.to_excel(excel_file, index=False)
    print(f"✅ Excel file '{excel_file}' created successfully!")

# Use your actual CSV file name here
csv_to_excel("data.csv", "comments_sentiments.xlsx")
