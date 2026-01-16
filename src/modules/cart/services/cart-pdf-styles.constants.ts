export const STANDARD_PDF_STYLES = `
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #BB1717;
        }
        .logo {
            max-width: 180px;
        }
        .title {
            text-align: center;
            flex: 1;
            margin: 0 20px;
        }
        .date {
            font-size: 14px;
            color: #666;
        }
        .info-section {
            width: 100%;
            margin-bottom: 30px;
            overflow: hidden;
        }
        .info-section:after {
            content: "";
            display: table;
            clear: both;
        }
        .customer-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #BB1717;
            float: left;
            width: 44%;
            margin-right: 30px;
            box-sizing: border-box;
        }
        .customer-info h3 {
            margin: 0 0 10px 0;
            color: #222222;
            font-size: 16px;
        }
        .customer-info p {
            margin: 3px 0;
            font-size: 12px;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            font-size: 11px;
        }
        .products-table th {
            background-color: #222222;
            color: white;
            padding: 10px 6px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #dee2e6;
            font-size: 10px;
        }
        .products-table td {
            padding: 10px 6px;
            border: 1px solid #dee2e6;
            text-align: center;
            vertical-align: middle;
            font-size: 10px;
        }
        .products-table tbody tr:nth-child(even) {
            background-color: #fdfdfd;
        }
        .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .product-name {
            text-align: left;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
            font-size: 10px;
        }
        .currency-cny {
            color: #666;
            font-weight: 500;
            font-size: 10px;
        }
        .currency-brl {
            color: #333;
            font-weight: 500;
            font-size: 10px;
        }
        .total-row {
            background-color: #e9ecef !important;
            font-weight: bold;
            font-size: 10px;
        }
        .total-row td {
            border-top: 2px solid #BB1717;
            font-size: 10px;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #BB1717;
            float: left;
            width: 44%;
            margin-left: 30px;
            box-sizing: border-box;
        }
        .notice-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #BB1717;
            width: 45%;
            margin-top: 15px;
            margin-right: 20px;
            box-sizing: border-box;
            font-size: 12px;
            text-align: left;
            float: left;
            clear: left;
        }
        .notice-box h3 {
            margin: 0 0 10px 0;
            color: #222222;
            font-size: 16px;
        }
        .notice-box p {
            margin: 0;
            color: #222222;
            font-weight: bold;
            line-height: 1.3;
        }
        .summary h3 {
            margin: 0 0 10px 0;
            color: #222222;
            font-size: 16px;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            padding: 2px 0;
            font-size: 12px;
        }
        .summary-item.total {
            border-top: 2px solid #BB1717;
            font-weight: bold;
            font-size: 1.1em;
            margin-top: 15px;
            padding-top: 10px;
        }
        .final-value {
            background-color: #f8f9fa !important;
            color: #333 !important;
            font-weight: bold !important;
            font-size: 10px !important;
        }
        .final-value-header {
            background-color: #BB1717 !important;
            color: white !important;
        }
`

export const DETAILED_PDF_STYLES = `
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            line-height: 1.4;
            color: #1A1A1A;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            background: #1A1A1A;
            color: white;
            border-radius: 15px;
            padding: 10px 20px;
            margin-bottom: 0;
            border: 3px solid #CC3333;
        }
        h1 {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-weight: bold;
            font-size: 27px;
            margin: 15px 0;
            color: white;
        }
        h2 {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-weight: bold;
            color: #1A1A1A;
            font-size: 19px;
            margin: 25px 0 15px 0;
            border-bottom: 2px solid #CC3333;
            padding-bottom: 5px;
        }
        .info-box {
            background: #f8f9fa;
            border: 1px solid #CC3333;
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
        }
        .calculation-step {
            background: #ffffff;
            border: 1px solid #ddd;
            border-left: 4px solid #CC3333;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .formula {
            background: #f5f5f5;
            border-left: 4px solid #1A1A1A;
            border-radius: 5px;
            padding: 12px;
            margin: 10px 0;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            font-weight: normal;
            line-height: 1.3;
        }
        .result {
            background: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
            font-weight: bold;
            color: #155724;
            font-size: 13px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 8px;
            line-height: 1.2;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px 6px;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
        }
        th {
            background: #1A1A1A;
            color: white;
            font-weight: bold;
            font-size: 8px;
        }
        .total-row {
            background: #f8f9fa;
            font-weight: bold;
        }
        .highlight {
            background: #CC3333;
            color: white;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
        }
        .page-break {
            page-break-before: always;
        }
        .summary-box {
            background: #1A1A1A;
            color: white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border: 2px solid #CC3333;
        }
        .summary-box h3 {
            color: #CC3333;
            margin-top: 0;
            font-size: 19px;
        }
        .currency {
            font-weight: bold;
            color: #CC3333;
            font-size: 10px;
        }
        .compact-table {
            font-size: 8px;
        }
        .compact-table th, .compact-table td {
            padding: 6px 4px;
            line-height: 1.1;
        }
        .compact-table .calc-column {
            width: 25%;
            font-size: 8px;
        }
        .compact-table .value-column {
            width: 15%;
            text-align: right;
            white-space: nowrap;
        }
        .compact-table .tax-column {
            width: 12%;
            text-align: center;
        }
        .compact-table .base-column {
            width: 15%;
            text-align: center;
        }
        .product-name {
            font-size: 13px;
            font-weight: bold;
            color: #1A1A1A;
            margin: 15px 0 5px 0;
        }
        .ncm-info {
            font-size: 10px;
            color: #666;
            margin-bottom: 10px;
        }
        .no-break {
            white-space: nowrap;
        }
        .small-text {
            font-size: 8px;
            line-height: 1.1;
        }
        .company-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #CC3333;
            color: #6c757d;
            font-size: 10px;
        }
`






