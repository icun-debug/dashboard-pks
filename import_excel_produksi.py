import pandas as pd

# lokasi file excel
file_excel = "daily_production.xlsx"

# baca sheet DB
df = pd.read_excel(file_excel, sheet_name="DB")

# tampilkan 5 baris pertama
print(df.head())