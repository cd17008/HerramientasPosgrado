export const EXCEL_STYLES = {
  borderThin: {
    top: { style: 'thin', color: { rgb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
    left: { style: 'thin', color: { rgb: 'CBD5E1' } },
    right: { style: 'thin', color: { rgb: 'CBD5E1' } }
  },
  headerDark: {
    fill: { fgColor: { rgb: '1E293B' } }, // Slate 800
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  },
  headerLight: {
    fill: { fgColor: { rgb: 'F1F5F9' } }, // Slate 100
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  },
  cellText: {
    font: { name: 'Calibri', sz: 10 },
    alignment: { horizontal: 'left', vertical: 'center' }
  },
  cellCenter: {
    font: { name: 'Calibri', sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' }
  },
  cellNumber: {
    font: { name: 'Calibri', sz: 10, bold: true },
    alignment: { horizontal: 'right', vertical: 'center' }
  }
};