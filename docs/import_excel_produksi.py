import pandas as pd
import mysql.connector

# koneksi database (sama seperti api.py)
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="test"
    )

# baca excel
file_excel = "daily_production.xlsx"
df = pd.read_excel(file_excel, sheet_name="DB")

# hapus kolom kosong
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

# ganti NaN menjadi None
df = df.where(pd.notnull(df), None)

# test hanya 10 bari dulu
df = df.head(5)

print("Jumlah data yang akan diimport:", len(df))


conn = get_connection()
cursor = conn.cursor()

for index, row in df.iterrows():

    print("Import baris:", index)

    sql = """
    INSERT INTO produksi_harian
    (tanggal, mill_code, group_name, region, pt, mill,
     tbs_masuk, cpo, kernel, oer, ker,
     jam_olah, kapasitas_olah, utility, hari_olah)

    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    data = (
        row['TANGGAL'],
        row['MILL'],
        row['GROUP'],
        row['REG'],
        row['PT'],
        row['MILL'],

        row['TOTAL MASUK'],
        row['CPO'],
        row['KERNEL'],
        row['OER'],
        row['KER'],

        row['JAM OLAH'],
        row['KAP. OLAH'],
        row['UTILITI'],
        row['HARI OLAH']
    )

    cursor.execute(sql, data)

conn.commit()

print("Import selesai!")
print("Jumlah data:", len(df))