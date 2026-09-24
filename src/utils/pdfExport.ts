import { RppModulAjar, LKPDDocument, SchoolProfile, AsesmenDaringPackage } from '../types';

export function printDocument(elementId: string) {
  const content = document.getElementById(elementId);
  if (!content) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popup blocked in iframe, trigger window.print directly
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Dokumen Pembelajaran SMAN 1 Lampasio</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 20mm 20mm 25mm;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            color: #111;
            line-height: 1.4;
            font-size: 11.5pt;
            background: #fff;
            padding: 0;
            margin: 0;
          }
          .kop-surat {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 8px;
            margin-bottom: 16px;
          }
          .kop-surat h4 { margin: 0; font-size: 11pt; font-weight: bold; }
          .kop-surat h3 { margin: 2px 0; font-size: 12.5pt; font-weight: bold; }
          .kop-surat h2 { margin: 2px 0; font-size: 14pt; font-weight: bold; letter-spacing: 0.5px; }
          .kop-surat p { margin: 2px 0 0 0; font-size: 9.5pt; font-style: italic; }
          
          .doc-title {
            text-align: center;
            margin-bottom: 20px;
          }
          .doc-title h2 {
            margin: 0;
            font-size: 13pt;
            text-decoration: underline;
            font-weight: bold;
          }
          .doc-title p {
            margin: 4px 0 0 0;
            font-size: 10.5pt;
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10.5pt;
          }
          table.bordered th, table.bordered td {
            border: 1px solid #333;
            padding: 6px 8px;
            vertical-align: top;
          }
          table.bordered th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: left;
          }
          table.no-border td {
            border: none;
            padding: 3px 6px;
            vertical-align: top;
          }

          .section-heading {
            font-size: 11.5pt;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 16px;
            margin-bottom: 6px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 2px;
          }
          .sub-heading {
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 4px;
          }
          ul, ol {
            margin: 4px 0 10px 24px;
            padding: 0;
          }
          li {
            margin-bottom: 3px;
          }
          .signature-box {
            margin-top: 35px;
            page-break-inside: avoid;
          }
          .signature-box table td {
            border: none;
            vertical-align: top;
            font-size: 11pt;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            background: #e2e8f0;
            border-radius: 4px;
            font-size: 9pt;
            font-weight: 600;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
