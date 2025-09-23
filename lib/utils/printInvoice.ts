import type { Invoice } from "@/lib/types"

export function printInvoice(invoice: Invoice, template: 'modern' | 'simple' | 'minimal' = 'modern') {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les pop-ups sont autorisés.")
  }

  // Get the actual invoice items from the invoice object
  const invoiceItemsForPrint = invoice.invoice_items || []

  // Payment status display
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Payée"
      case "unpaid": return "Non payée"
      case "refunded": return "Remboursée"
      default: return "Non payée"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "#16a34a"
      case "unpaid": return "#ca8a04"
      case "refunded": return "#6b7280"
      default: return "#ca8a04"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`
  }

  // Generate QR code data (simplified - could be enhanced with actual QR code generation)
  const generateQRData = () => {
    return `INV:${invoice.invoice_number}|AMT:${invoice.total_amount}|DATE:${invoice.invoice_date}`
  }

  let htmlContent = ''

  switch (template) {
    case 'minimal':
      htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Facture ${invoice.invoice_number}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: #ffffff;
                font-size: 12px;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }

              @media print {
                body {
                  font-size: 11px;
                  line-height: 1.4;
                }

                @page {
                  size: A4;
                  margin: 15mm;
                }
              }

              .invoice-container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
              }

              @media print {
                .invoice-container {
                  padding: 0;
                  margin: 0;
                  max-width: none;
                  border: none;
                  border-radius: 0;
                }
              }

              /* Header Section */
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #3b82f6;
              }

              .company-info {
                flex: 1;
              }

              .company-name {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
              }

              .company-details {
                font-size: 10px;
                color: #6b7280;
                line-height: 1.5;
              }

              .company-details div {
                margin-bottom: 2px;
              }

              .invoice-info {
                text-align: right;
                min-width: 120px;
              }

              .invoice-title {
                font-size: 18px;
                font-weight: 700;
                color: #3b82f6;
                margin-bottom: 8px;
              }

              .invoice-number {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
              }

              .invoice-date {
                font-size: 10px;
                color: #6b7280;
              }

              /* Billing Section */
              .billing-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
              }

              .billing-group {
                background: #f8fafc;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
              }

              .billing-title {
                font-size: 11px;
                font-weight: 700;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 4px;
              }

              .billing-content {
                font-size: 11px;
                color: #4b5563;
                line-height: 1.5;
              }

              .billing-content div {
                margin-bottom: 3px;
              }

              .billing-content strong {
                color: #1f2937;
                font-weight: 600;
              }

              /* Items Table */
              .items-section {
                margin-bottom: 25px;
              }

              .items-title {
                font-size: 14px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
              }

              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
                font-size: 11px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                overflow: hidden;
              }

              .items-table thead {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
              }

              .items-table th {
                padding: 12px 15px;
                text-align: left;
                font-weight: 600;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .items-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #f1f5f9;
                vertical-align: top;
              }

              .items-table tbody tr:last-child td {
                border-bottom: none;
              }

              .items-table tbody tr:hover {
                background: #f8fafc;
              }

              .item-name {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 2px;
              }

              .item-description {
                color: #6b7280;
                font-size: 9px;
                font-style: italic;
              }

              .quantity-cell,
              .unit-price-cell,
              .total-cell {
                text-align: right;
                font-weight: 600;
                font-family: 'Courier New', monospace;
                color: #374151;
              }

              .total-cell {
                font-weight: 700;
                color: #1f2937;
              }

              /* Totals Section */
              .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 25px;
              }

              .totals-box {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-radius: 8px;
                padding: 20px;
                min-width: 200px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }

              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 0;
                border-bottom: 1px solid #e2e8f0;
              }

              .total-row:last-child {
                border-bottom: none;
                border-top: 2px solid #3b82f6;
                padding-top: 10px;
                margin-top: 8px;
              }

              .total-label {
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
              }

              .total-amount {
                font-size: 11px;
                font-weight: 700;
                color: #1f2937;
                font-family: 'Courier New', monospace;
              }

              .grand-total .total-label,
              .grand-total .total-amount {
                font-size: 13px;
                font-weight: 800;
                color: #1f2937;
              }

              /* Notes Section */
              .notes-section {
                margin-bottom: 20px;
                padding: 12px;
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-radius: 6px;
                border-left: 4px solid #f59e0b;
              }

              .notes-title {
                font-size: 11px;
                font-weight: 700;
                color: #92400e;
                margin-bottom: 6px;
              }

              .notes-content {
                color: #78350f;
                font-size: 10px;
                line-height: 1.5;
              }

              /* Footer */
              .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 9px;
                line-height: 1.5;
              }

              .footer-thanks {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 6px;
                font-size: 11px;
              }

              /* Print Optimizations */
              @media print {
                .no-print {
                  display: none !important;
                }

                .invoice-container {
                  padding: 0;
                  margin: 0;
                  border: none;
                  box-shadow: none;
                }

                .items-table {
                  font-size: 10px;
                }

                .items-table th,
                .items-table td {
                  padding: 8px 12px;
                }

                .header {
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                }

                .company-name {
                  font-size: 20px;
                }

                .invoice-title {
                  font-size: 16px;
                }

                .billing-section {
                  gap: 20px;
                  margin-bottom: 20px;
                }

                .billing-group {
                  padding: 10px;
                }

                .totals-box {
                  padding: 15px;
                }

                .footer {
                  margin-top: 20px;
                  padding-top: 10px;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <!-- Header Section -->
              <div class="header">
                <div class="company-info">
                  <div class="company-name">Votre Entreprise</div>
                  <div class="company-details">
                    <div>123 Rue de l'Entreprise</div>
                    <div>Dakar, Sénégal</div>
                    <div>Tél: +221 33 123 45 67</div>
                    <div>Email: contact@entreprise.sn</div>
                    <div>N° RCCM: SN-DKR-2024-B-12345</div>
                  </div>
                </div>
                <div class="invoice-info">
                  <div class="invoice-title">FACTURE</div>
                  <div class="invoice-number">${invoice.invoice_number}</div>
                  <div class="invoice-date">Date: ${new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>

              <!-- Billing Information -->
              <div class="billing-section">
                <div class="billing-group">
                  <div class="billing-title">Facturé à</div>
                  <div class="billing-content">
                    <div><strong>${invoice.client_name || 'Client'}</strong></div>
                    ${invoice.client_address ? `<div>${invoice.client_address}</div>` : ''}
                    ${invoice.client_phone ? `<div>${invoice.client_phone}</div>` : ''}
                    ${invoice.client_email ? `<div>${invoice.client_email}</div>` : ''}
                  </div>
                </div>
                <div class="billing-group">
                  <div class="billing-title">Détails de la Facture</div>
                  <div class="billing-content">
                    <div><strong>Date d'émission:</strong> ${new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</div>
                    <div><strong>Date d'échéance:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("fr-FR") : 'À réception'}</div>
                    <div><strong>Statut:</strong> <span style="color: ${getPaymentStatusColor(invoice.payment_status)};">${getPaymentStatusText(invoice.payment_status)}</span></div>
                    <div><strong>Devise:</strong> FCFA (XOF)</div>
                  </div>
                </div>
              </div>

              <!-- Items Section -->
              <div class="items-section">
                <div class="items-title">Articles & Services</div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="width: 35%;">Description</th>
                      <th style="width: 15%; text-align: center;">Qté</th>
                      <th style="width: 20%; text-align: right;">Prix Unit.</th>
                      <th style="width: 30%; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoiceItemsForPrint.map((item, index) => `
                      <tr>
                        <td>
                          <div class="item-name">${item.product_name || 'Article ' + (index + 1)}</div>
                          ${item.marque ? `<div class="item-description">Marque: ${item.marque}</div>` : ''}
                          ${item.modele ? `<div class="item-description">Modèle: ${item.modele}</div>` : ''}
                          ${item.imei ? `<div class="item-description">SN: ${item.imei}</div>` : ''}
                          ${item.provenance ? `<div class="item-description">Provenance: ${item.provenance}</div>` : ''}
                        </td>
                        <td class="quantity-cell">${item.quantity || 1}</td>
                        <td class="unit-price-cell">${formatCurrency(item.unit_price || 0)}</td>
                        <td class="total-cell">${formatCurrency((item.quantity || 1) * (item.unit_price || 0))}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Totals Section -->
              <div class="totals-section">
                <div class="totals-box">
                  <div class="total-row">
                    <span class="total-label">Sous-total HT</span>
                    <span class="total-amount">${formatCurrency(invoice.subtotal || 0)}</span>
                  </div>
                  <div class="total-row">
                    <span class="total-label">TVA (${invoice.tax_rate || 18}%)</span>
                    <span class="total-amount">${formatCurrency(invoice.tax_amount || 0)}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span class="total-label">Total TTC</span>
                    <span class="total-amount">${formatCurrency(invoice.total_amount || 0)}</span>
                  </div>
                </div>
              </div>

              <!-- Notes Section -->
              ${invoice.notes ? `
                <div class="notes-section">
                  <div class="notes-title">Notes & Commentaires</div>
                  <div class="notes-content">${invoice.notes}</div>
                </div>
              ` : ''}

              <!-- Footer -->
              <div class="footer">
                <div class="footer-thanks">Merci pour votre confiance et votre business !</div>
                <div style="margin: 8px 0;">
                  <strong>Conditions de paiement:</strong> Règlement à 30 jours - Pénalités de retard: 1.5% par mois<br>
                  <strong>Modalités:</strong> Virement bancaire, chèque ou espèces - Marchandise sous réserve de propriété
                </div>
                <div style="margin-top: 8px; color: #9ca3af;">
                  Facture générée le ${new Date().toLocaleDateString("fr-FR", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - Valable sans signature
                </div>
                <div style="margin-top: 6px; font-weight: 600;">
                  Votre Entreprise © ${new Date().getFullYear()}
                </div>
              </div>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() {
                    setTimeout(function() { window.close(); }, 100);
                  };
                  setTimeout(function() {
                    if (window.onafterprint === undefined) {
                      window.close();
                    }
                  }, 3000);
                }, 800);
              };
            </script>
          </body>
        </html>
      `
      break

    default:
      // Professional Modern Template
      htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Facture ${invoice.invoice_number}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: #ffffff;
                font-size: 12px;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }

              @media print {
                body {
                  font-size: 11px;
                  line-height: 1.4;
                }

                @page {
                  size: A4;
                  margin: 15mm;
                }
              }

              .invoice-container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
              }

              @media print {
                .invoice-container {
                  padding: 0;
                  margin: 0;
                  max-width: none;
                  border: none;
                  border-radius: 0;
                }
              }

              /* Header Section */
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #3b82f6;
              }

              .company-info {
                flex: 1;
              }

              .company-name {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
              }

              .company-details {
                font-size: 10px;
                color: #6b7280;
                line-height: 1.5;
              }

              .company-details div {
                margin-bottom: 2px;
              }

              .invoice-info {
                text-align: right;
                min-width: 120px;
              }

              .invoice-title {
                font-size: 18px;
                font-weight: 700;
                color: #3b82f6;
                margin-bottom: 8px;
              }

              .invoice-number {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
              }

              .invoice-date {
                font-size: 10px;
                color: #6b7280;
              }

              /* Billing Section */
              .billing-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
              }

              .billing-group {
                background: #f8fafc;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
              }

              .billing-title {
                font-size: 11px;
                font-weight: 700;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 4px;
              }

              .billing-content {
                font-size: 11px;
                color: #4b5563;
                line-height: 1.5;
              }

              .billing-content div {
                margin-bottom: 3px;
              }

              .billing-content strong {
                color: #1f2937;
                font-weight: 600;
              }

              /* Items Table */
              .items-section {
                margin-bottom: 25px;
              }

              .items-title {
                font-size: 14px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
              }

              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
                font-size: 11px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                overflow: hidden;
              }

              .items-table thead {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
              }

              .items-table th {
                padding: 12px 15px;
                text-align: left;
                font-weight: 600;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .items-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #f1f5f9;
                vertical-align: top;
              }

              .items-table tbody tr:last-child td {
                border-bottom: none;
              }

              .items-table tbody tr:hover {
                background: #f8fafc;
              }

              .item-name {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 2px;
              }

              .item-description {
                color: #6b7280;
                font-size: 9px;
                font-style: italic;
              }

              .quantity-cell,
              .unit-price-cell,
              .total-cell {
                text-align: right;
                font-weight: 600;
                font-family: 'Courier New', monospace;
                color: #374151;
              }

              .total-cell {
                font-weight: 700;
                color: #1f2937;
              }

              .product-service-cell {
                font-weight: 600;
                color: #1f2937;
              }

              .description-cell {
                color: #6b7280;
                font-size: 10px;
              }

              /* Totals Section */
              .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 25px;
              }

              .totals-box {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-radius: 8px;
                padding: 20px;
                min-width: 200px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }

              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 0;
                border-bottom: 1px solid #e2e8f0;
              }

              .total-row:last-child {
                border-bottom: none;
                border-top: 2px solid #3b82f6;
                padding-top: 10px;
                margin-top: 8px;
              }

              .total-label {
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
              }

              .total-amount {
                font-size: 11px;
                font-weight: 700;
                color: #1f2937;
                font-family: 'Courier New', monospace;
              }

              .grand-total .total-label,
              .grand-total .total-amount {
                font-size: 13px;
                font-weight: 800;
                color: #1f2937;
              }

              /* Notes Section */
              .notes-section {
                margin-bottom: 20px;
                padding: 12px;
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-radius: 6px;
                border-left: 4px solid #f59e0b;
              }

              .notes-title {
                font-size: 11px;
                font-weight: 700;
                color: #92400e;
                margin-bottom: 6px;
              }

              .notes-content {
                color: #78350f;
                font-size: 10px;
                line-height: 1.5;
              }

              /* Footer */
              .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 9px;
                line-height: 1.5;
              }

              .footer-thanks {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 6px;
                font-size: 11px;
              }

              /* Print Optimizations */
              @media print {
                .no-print {
                  display: none !important;
                }

                .invoice-container {
                  padding: 0;
                  margin: 0;
                  border: none;
                  box-shadow: none;
                }

                .items-table {
                  font-size: 10px;
                }

                .items-table th,
                .items-table td {
                  padding: 8px 12px;
                }

                .header {
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                }

                .company-name {
                  font-size: 20px;
                }

                .invoice-title {
                  font-size: 16px;
                }

                .billing-section {
                  gap: 20px;
                  margin-bottom: 20px;
                }

                .billing-group {
                  padding: 10px;
                }

                .totals-box {
                  padding: 15px;
                }

                .footer {
                  margin-top: 20px;
                  padding-top: 10px;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <!-- Header Section -->
              <div class="header">
                <div class="company-info">
                  <div class="company-name">Votre Entreprise</div>
                  <div class="company-details">
                    <div>123 Rue de l'Entreprise</div>
                    <div>Dakar, Sénégal</div>
                    <div>Tél: +221 33 123 45 67</div>
                    <div>Email: contact@entreprise.sn</div>
                    <div>N° RCCM: SN-DKR-2024-B-12345</div>
                  </div>
                </div>
                <div class="invoice-info">
                  <div class="invoice-title">FACTURE</div>
                  <div class="invoice-number">${invoice.invoice_number}</div>
                  <div class="invoice-date">Date: ${new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>

              <!-- Billing Information -->
              <div class="billing-section">
                <div class="billing-group">
                  <div class="billing-title">Facturé à</div>
                  <div class="billing-content">
                    <div><strong>${invoice.client_name || 'Client'}</strong></div>
                    ${invoice.client_address ? `<div>${invoice.client_address}</div>` : ''}
                    ${invoice.client_phone ? `<div>${invoice.client_phone}</div>` : ''}
                    ${invoice.client_email ? `<div>${invoice.client_email}</div>` : ''}
                  </div>
                </div>
                <div class="billing-group">
                  <div class="billing-title">Détails de la Facture</div>
                  <div class="billing-content">
                    <div><strong>Date d'émission:</strong> ${new Date(invoice.invoice_date).toLocaleDateString("fr-FR")}</div>
                    <div><strong>Date d'échéance:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("fr-FR") : 'À réception'}</div>
                    <div><strong>Statut:</strong> <span style="color: ${getPaymentStatusColor(invoice.payment_status)};">${getPaymentStatusText(invoice.payment_status)}</span></div>
                    <div><strong>Devise:</strong> FCFA (XOF)</div>
                  </div>
                </div>
              </div>

              <!-- Items Section -->
              <div class="items-section">
                <div class="items-title">Articles & Services</div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="width: 20%;">Produit/Service</th>
                      <th style="width: 25%;">Détails</th>
                      <th style="width: 10%; text-align: center;">Qté</th>
                      <th style="width: 20%; text-align: right;">Prix Unit.</th>
                      <th style="width: 25%; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoiceItemsForPrint.map((item, index) => `
                      <tr>
                        <td class="product-service-cell">
                          <div class="item-name">${item.product_name || 'Article ' + (index + 1)}</div>
                          ${item.marque ? `<div class="item-description">Marque: ${item.marque}</div>` : ''}
                          ${item.modele ? `<div class="item-description">Modèle: ${item.modele}</div>` : ''}
                        </td>
                        <td class="description-cell">
                          ${item.imei ? `<div>SN: ${item.imei}</div>` : ''}
                          ${item.provenance ? `<div>Provenance: ${item.provenance}</div>` : ''}
                        </td>
                        <td style="text-align: center;">${item.quantity || 1}</td>
                        <td class="unit-price-cell">${formatCurrency(item.unit_price || 0)}</td>
                        <td class="total-cell">${formatCurrency((item.quantity || 1) * (item.unit_price || 0))}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Totals Section -->
              <div class="totals-section">
                <div class="totals-box">
                  <div class="total-row">
                    <span class="total-label">Sous-total HT</span>
                    <span class="total-amount">${formatCurrency(invoice.subtotal || 0)}</span>
                  </div>
                  <div class="total-row">
                    <span class="total-label">TVA (${invoice.tax_rate || 18}%)</span>
                    <span class="total-amount">${formatCurrency(invoice.tax_amount || 0)}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span class="total-label">Total TTC</span>
                    <span class="total-amount">${formatCurrency(invoice.total_amount || 0)}</span>
                  </div>
                </div>
              </div>

              <!-- Notes Section -->
              ${invoice.notes ? `
                <div class="notes-section">
                  <div class="notes-title">Notes & Commentaires</div>
                  <div class="notes-content">${invoice.notes}</div>
                </div>
              ` : ''}

              <!-- Footer -->
              <div class="footer">
                <div class="footer-thanks">Merci pour votre confiance et votre business !</div>
                <div style="margin: 8px 0;">
                  <strong>Conditions de paiement:</strong> Règlement à 30 jours - Pénalités de retard: 1.5% par mois<br>
                  <strong>Modalités:</strong> Virement bancaire, chèque ou espèces - Marchandise sous réserve de propriété
                </div>
                <div style="margin-top: 8px; color: #9ca3af;">
                  Facture générée le ${new Date().toLocaleDateString("fr-FR", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - Valable sans signature
                </div>
                <div style="margin-top: 6px; font-weight: 600;">
                  Votre Entreprise © ${new Date().getFullYear()}
                </div>
              </div>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() {
                    setTimeout(function() { window.close(); }, 100);
                  };
                  setTimeout(function() {
                    if (window.onafterprint === undefined) {
                      window.close();
                    }
                  }, 3000);
                }, 800);
              };
            </script>
          </body>
        </html>
      `
  }

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}