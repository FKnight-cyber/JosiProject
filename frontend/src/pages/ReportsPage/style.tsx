import styled from "styled-components/macro";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-y: scroll;
  box-sizing: border-box;
  /* Mesmo template no cabeçalho e nas linhas = colunas alinhadas */
  --report-product-cols: minmax(0, 1fr) 6rem 7rem 7.25rem;
  /* Mesmo template no cabeçalho e em cada linha — larguras mínimas estáveis (evita max-content só no título) */
  --report-pay-cols: minmax(9.5rem, 14%) minmax(11.5rem, 20%) minmax(0, 1fr);
  --report-pay-gap: 20px;

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .info.report-products-head {
    display: grid !important;
    grid-template-columns: var(--report-product-cols);
    column-gap: 10px;
    row-gap: 6px;
    align-items: center;
    justify-items: stretch;
    padding: 12px 16px !important;
  }

  .info.report-products-head h4 {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    white-space: nowrap;
  }

  .info.report-products-head h4:nth-child(1) {
    justify-self: start;
    min-width: 0;
  }

  .info.report-products-head h4:nth-child(2),
  .info.report-products-head h4:nth-child(3),
  .info.report-products-head h4:nth-child(4) {
    justify-self: end;
    text-align: right;
  }

  .report-product-row {
    padding: 12px 16px !important;
    margin-bottom: 1px;
  }

  .report-product-row .left {
    display: grid !important;
    grid-template-columns: var(--report-product-cols);
    column-gap: 10px;
    row-gap: 6px;
    align-items: center;
    width: 100%;
    padding: 0 !important;
  }

  .report-product-row .left h5 {
    width: auto !important;
    margin: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.3;
  }

  .report-product-row .left .cell-nome {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    font-size: 14px;
  }

  .report-product-row .left .cell-qtd,
  .report-product-row .left .cell-preco,
  .report-product-row .left .cell-total {
    white-space: nowrap;
    justify-self: end;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* Pagamentos: Valor | Forma | Detalhes */
  .info.report-payments-head {
    width: 100% !important;
    max-width: 100%;
    display: grid !important;
    grid-template-columns: var(--report-pay-cols);
    column-gap: var(--report-pay-gap);
    row-gap: 6px;
    align-items: center;
    justify-content: stretch;
    padding: 12px 16px !important;
    margin: 0 !important;
  }

  .info.report-payments-head h4 {
    font-size: 14px;
    margin: 0;
    line-height: 1.3;
    white-space: nowrap;
  }

  .info.report-payments-head h4:nth-child(1) {
    text-align: left;
  }

  .info.report-payments-head h4:nth-child(2) {
    text-align: left;
  }

  .info.report-payments-head h4:nth-child(3) {
    text-align: left;
    min-width: 0;
  }

  .report-payment-row {
    padding: 12px 16px !important;
    margin-bottom: 1px;
  }

  .report-payment-row .right {
    display: grid !important;
    grid-template-columns: var(--report-pay-cols);
    column-gap: var(--report-pay-gap);
    row-gap: 6px;
    align-items: center;
    justify-content: stretch;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .report-payment-row .right h5 {
    margin: 0;
    font-size: 14px;
    width: auto !important;
    line-height: 1.3;
  }

  .report-payment-row .cell-valor {
    text-align: left;
    justify-self: start;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    min-width: 0;
  }

  .report-payment-row .cell-forma {
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .report-payment-row .detalhes.cell-detalhes {
    width: auto !important;
    min-width: 0 !important;
    max-width: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  .organize.report-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 20px;
    height: auto;
    min-height: 44px;
    flex-wrap: nowrap;
    gap: 16px;
  }

  .organize.report-meta h3 {
    margin-right: 0;
    flex: 0 1 auto;
    font-size: 18px;
    font-weight: 600;
  }

  .organize.report-meta .report-meta-date {
    text-align: right;
    white-space: nowrap;
    margin-left: auto;
  }

  .saldo-final-valor.saldo-tone-negativo {
    color: #c62828;
  }

  .saldo-final-valor.saldo-tone-positivo {
    color: #2e7d32;
  }

  .saldo-final-valor.saldo-tone-zero {
    color: inherit;
  }

  .footer-line {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    flex-wrap: nowrap;
  }

  .footer-line .footer-label {
    flex: 1 1 auto;
    padding-right: 12px;
  }

  .footer-line .footer-value {
    flex: 0 0 auto;
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .saldo-final-row.footer-line strong {
    flex: 0 1 auto;
  }

  .saldo-final-row .saldo-final-valor {
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .organize {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    position: relative;

    h3 {
      margin-right: 240px;
    }
  }

  h1 {
    justify-content: center;
    font-size: 22px;
    font-weight: bolder;
  }

  h4 {
    font-size: 18px;
    font-weight: bolder;
  }

  .line {
    width: 100%;
    height: 2px;
    background-color: #000;
  }

  .info {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .footer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-top: 10px;
    padding-right: 20px;

    h4 {
      width: 340px;
      text-align: start;
    }

    h4.footer-summary {
      font-weight: 400;
    }

    h4.saldo-final-row {
      font-weight: 400;

      strong {
        font-weight: 700;
      }

      .saldo-final-valor {
        font-weight: 400;
      }
    }
  }

  .linefooter {
    width: 340px;
    height: 2px;
    background-color: #000;
    margin-top: 6px;
    margin-bottom: 6px;
  }

  .alert-icon {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  @media print {
    @page {
      margin: 12mm 10mm 14mm 10mm;
      size: A4 portrait;
    }

    .MuiTooltip-popper,
    .MuiTooltip-tooltip {
      display: none !important;
      visibility: hidden !important;
    }

    .alert-icon,
    .adiantamento-button {
      display: none !important;
    }

    .report-print {
      min-height: auto !important;
      overflow: visible !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-print .hide-on-pdf {
      display: none !important;
    }

    .report-print h1 {
      font-size: 16pt;
      page-break-after: avoid;
    }

    .report-print .organize.report-meta {
      justify-content: space-between;
      padding: 4px 0 8px;
      min-height: auto;
      height: auto;
    }

    .report-print .organize.report-meta h3 {
      margin-right: 0 !important;
      font-size: 11pt;
      font-weight: 600;
    }

    .report-print .info.report-products-head,
    .report-print .report-product-row .left {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) 17mm 19mm 21mm;
      column-gap: 10px;
      row-gap: 4px;
      align-items: center;
      padding: 8px 16px !important;
      width: 100% !important;
      box-sizing: border-box;
    }

    .report-print .info.report-products-head h4 {
      font-size: 10pt;
    }

    .report-print .report-product-row .left h5 {
      width: auto !important;
      max-width: 100%;
      font-size: 10pt;
      font-weight: normal;
      margin: 0;
    }

    .report-print .report-product-row .left .cell-nome {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      font-size: 10pt;
    }

    .report-print .report-product-row .left .cell-qtd,
    .report-print .report-product-row .left .cell-preco,
    .report-print .report-product-row .left .cell-total {
      white-space: nowrap;
      justify-self: end;
      text-align: right;
    }

    .report-print .report-product-row.total-row .left h5 {
      font-weight: bold;
    }

    .report-print .report-product-row {
      padding: 8px 16px !important;
      margin-bottom: 0 !important;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
    }

    .report-print .info.report-payments-head,
    .report-print .report-payment-row .right {
      display: grid !important;
      grid-template-columns: minmax(26mm, 15%) minmax(32mm, 22%) minmax(0, 1fr);
      column-gap: 5mm;
      row-gap: 4px;
      padding: 8px 16px !important;
      width: 100% !important;
      align-items: center;
      justify-content: stretch;
      box-sizing: border-box;
      margin: 0 !important;
    }

    .report-print .report-payment-row .detalhes.cell-detalhes {
      width: auto !important;
      min-height: 0 !important;
      font-size: 10pt;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .report-print .report-payment-row .cell-valor,
    .report-print .report-payment-row .cell-forma {
      font-size: 10pt;
      white-space: nowrap;
    }

    .report-print .report-payment-row {
      padding: 8px 16px !important;
      margin-bottom: 0 !important;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
    }

    .report-print .info.report-payments-head h4 {
      font-size: 10pt;
      margin: 0;
    }

    .report-print .info.report-payments-head h4:nth-child(1) {
      text-align: left;
    }

    .report-print .report-payment-row .cell-valor {
      text-align: left;
      justify-self: start;
    }

    .report-print .footer {
      align-items: flex-end;
      padding-top: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .report-print .footer h4 {
      width: min(100%, 420px);
      font-size: 11pt;
    }

    .report-print .footer-line .footer-label,
    .report-print .footer-line .footer-value {
      font-size: 11pt;
    }

    .report-print .linefooter {
      width: min(100%, 420px);
    }

    .saldo-final-valor.saldo-tone-negativo {
      color: #b71c1c !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .saldo-final-valor.saldo-tone-positivo {
      color: #1b5e20 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-print .line {
      background-color: #000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-print .linefooter {
      background-color: #000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-print .total-row {
      background-color: #eeeeee !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }

  .hide-on-pdf {
    @media print {
      display: none !important;
    }
  }
`

export const Purchase = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 12px;
  height: auto;
  width: 100%;
  padding: 20px;
  margin-bottom: 2px;

  &.report-payment-row {
    justify-content: flex-start;

    .right {
      width: 100% !important;
      max-width: 100%;
      flex: 1 1 auto;
      min-width: 0;
    }
  }

  &.total-row {
    border-top: 2px solid #000;
    font-weight: bold;
    background-color: #f5f5f5;
    height: auto;
    min-height: 12px;
    
    .left {
      h5 {
        font-weight: bold;
        
        &.move {
          font-weight: bold;
        }
      }
    }
  }

  .left {
    display: flex;
    justify-content: space-between;
    width: 100%;

    h5 {
      width: 14.2%;
    }

    .move {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }
  }

  .right {
    display: flex;
    justify-content: space-between;
    width: 50%;
  }

  .detalhes {
    width: 300px;
    min-height: 26px;
    height: auto;
    word-wrap: break-word;
    overflow: visible;
    white-space: normal;
    line-height: 1.2;
  }
`
