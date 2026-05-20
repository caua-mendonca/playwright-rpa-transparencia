import sys
import os
import pandas as pd


def convert(csv_path: str) -> str:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Arquivo não encontrado: {csv_path}")

    xlsx_path = csv_path.replace(".csv", ".xlsx")

    df = pd.read_csv(csv_path, encoding="utf-8", sep=",", quotechar='"')
    df.to_excel(xlsx_path, index=False, engine="openpyxl")

    print(f"XLSX gerado: {xlsx_path}")
    return xlsx_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python convert_to_xlsx.py <caminho_do_csv>")
        sys.exit(1)

    convert(sys.argv[1])
