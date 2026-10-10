import fitz  # PyMuPDF
import sys

def convert_pdf_to_png(pdf_path, png_path):
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)  # first page
    pix = page.get_pixmap(dpi=300)
    pix.save(png_path)
    print(f"Saved logo to {png_path}")

if __name__ == "__main__":
    pdf_file = "C:\\Users\\girid\\.gemini\\antigravity-ide\\brain\\998205fe-f11c-45ad-ae4f-0f10ea1f8f08\\.user_uploaded\\media_1791626009398.pdf"
    png_file = "e:\\Projects\\cafe-connect-system\\frontend\\public\\logo.png"
    convert_pdf_to_png(pdf_file, png_file)
