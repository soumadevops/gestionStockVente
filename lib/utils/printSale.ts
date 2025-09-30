export function printSale(sale: any, action: 'print' | 'download' = 'print') {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les pop-ups sont autorisés.")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reçu de Vente ${sale.id.slice(-6).toUpperCase()}</title>
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
              font-size: 10px;
              line-height: 1.4;
            }

            @page {
              size: A5;
              margin: 8mm;
            }
          }

          .receipt-container {
            max-width: 148mm;
            margin: 0 auto;
            padding: 15mm;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }

          @media print {
            .receipt-container {
              padding: 5mm;
              margin: 0;
              max-width: none;
              border: none;
              border-radius: 0;
            }
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #16a34a;
          }

          .company-name {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
          }

          .company-details {
            font-size: 9px;
            color: #6b7280;
            line-height: 1.4;
          }

          .receipt-title {
            font-size: 16px;
            font-weight: 700;
            color: #16a34a;
            margin: 15px 0;
          }

          .receipt-number {
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }

          .receipt-date {
            font-size: 9px;
            color: #6b7280;
          }

          .client-section {
            margin-bottom: 15px;
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }

          .section-title {
            font-size: 10px;
            font-weight: 700;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }

          .client-info {
            font-size: 10px;
            color: #4b5563;
            line-height: 1.5;
          }

          .product-section {
            margin-bottom: 15px;
          }

          .product-details {
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            margin-bottom: 8px;
          }

          .product-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }

          .product-info {
            font-size: 9px;
            color: #6b7280;
            line-height: 1.4;
          }

          .price-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin-bottom: 15px;
          }

          .price-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
          }

          .price-amount {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            font-family: 'Courier New', monospace;
          }

          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 8px;
            line-height: 1.4;
          }

          .footer-thanks {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
            font-size: 10px;
          }

          @media print {
            .no-print {
              display: none !important;
            }

            .receipt-container {
              padding: 3mm;
              margin: 0;
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">Votre Entreprise</div>
            <div class="company-details">
              <div>123 Rue de l'Entreprise</div>
              <div>Dakar, Sénégal</div>
              <div>Tél: +221 33 123 45 67</div>
              <div>Email: contact@entreprise.sn</div>
            </div>
          </div>

          <div class="receipt-title">REÇU DE VENTE</div>
          <div class="receipt-number">N° ${sale.id.slice(-6).toUpperCase()}</div>
          <div class="receipt-date">Date: ${new Date(sale.date_vente).toLocaleDateString("fr-FR")}</div>

          <!-- Client Information -->
          <div class="client-section">
            <div class="section-title">Informations Client</div>
            <div class="client-info">
              <div><strong>${sale.nom_prenom_client}</strong></div>
              <div>Téléphone: ${sale.numero_telephone}</div>
            </div>
          </div>

          <!-- Product Information -->
          <div class="product-section">
            <div class="section-title">Détails du Produit</div>
            <div class="product-details">
              <div class="product-name">${sale.marque} ${sale.modele}</div>
              <div class="product-info">
                <div>Marque: ${sale.marque}</div>
                <div>Modèle: ${sale.modele}</div>
                ${sale.imei_telephone ? `<div>IMEI: ${sale.imei_telephone}</div>` : ''}
                ${sale.nom_produit ? `<div>Produit: ${sale.nom_produit}</div>` : ''}
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="price-section">
            <span class="price-label">Montant Total</span>
            <span class="price-amount">${formatCurrency(sale.prix)}</span>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-thanks">Merci pour votre achat !</div>
            <div style="margin: 6px 0;">
              <strong>Conditions:</strong> Garantie 1 an - Service après-vente disponible<br>
              <strong>Support:</strong> Contactez-nous pour toute assistance
            </div>
            <div style="margin-top: 6px; color: #9ca3af;">
              Reçu généré le ${new Date().toLocaleDateString("fr-FR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div style="margin-top: 4px; font-weight: 600;">
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

  if (action === 'download') {
    // For download, we'd need html2pdf, but for now just print
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  } else {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
}