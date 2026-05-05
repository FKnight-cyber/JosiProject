// @ts-ignore
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Container, Purchase } from "./style";
import axios from "axios";
import { 
  Tooltip, 
  IconButton, 
  Box,
  Button,
} from "@mui/material";
import { Warning, PictureAsPdf } from "@mui/icons-material";

export default function ReportsPage() {
  const [info, setInfo] = useState();
  const [purchases, setPurchases] = useState();
  /** Lista completa de lançamentos (GET /all); null = ainda não carregado */
  const [adiantamentos, setAdiantamentos] = useState(null);
  const [adiantamentosAteDataCompra, setAdiantamentosAteDataCompra] = useState();
  const [cliente, setCliente] = useState();
  const [isPdfExport, setIsPdfExport] = useState(false);

  const { purchaseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar se é uma exportação PDF
    const checkIfPdfExport = () => {
      // Verificar se é uma impressão ou exportação PDF
      const isPrinting = window.matchMedia && window.matchMedia('print').matches;
      const isPdfExport = isPrinting || window.location.search.includes('pdf=true');
      setIsPdfExport(isPdfExport);
    };

    // Verificar na inicialização
    checkIfPdfExport();

    // Listener para mudanças de mídia (impressão)
    const mediaQuery = window.matchMedia('print');
    const handleMediaChange = (e) => {
      setIsPdfExport(e.matches);
    };

    mediaQuery.addListener(handleMediaChange);

    // Cleanup
    return () => {
      mediaQuery.removeListener(handleMediaChange);
    };
  }, []);

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/purchases/${purchaseId}`);

    promise.then(res => {
      setPurchases(res.data);
      
      // Buscar dados do cliente
      let clientId = null;
      
      if (res.data && res.data.cliente) {
        setCliente(res.data.cliente);
        clientId = res.data.cliente.id;
      } else if (res.data && res.data.clientId) {
        clientId = res.data.clientId;
      } else if (res.data && res.data.clienteId) {
        clientId = res.data.clienteId;
      }
      
      if (clientId) {
        buscarAdiantamentos(clientId);
        
        if (res.data && res.data.data) {
          buscarAdiantamentosAteDataCompra(clientId, res.data.data);
        }
      } else {
        const urlParts = window.location.pathname.split('/');
        const clientIdFromUrl = urlParts[2];
        if (clientIdFromUrl && !isNaN(clientIdFromUrl)) {
          buscarAdiantamentos(parseInt(clientIdFromUrl));
          
          if (res.data && res.data.data) {
            buscarAdiantamentosAteDataCompra(parseInt(clientIdFromUrl), res.data.data);
          }
        } else {
          setAdiantamentos([]);
        }
      }
    });

    const promise2 = axios.get(`${import.meta.env.VITE_URL}/info`);

    promise2.then(res => {
      setInfo(res.data);
    })

  },[]);

  async function buscarAdiantamentos(clientId) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL}/advances/client/${clientId}/all`);
      const raw = response.data;
      setAdiantamentos(Array.isArray(raw) ? raw : []);
    } catch (error) {
      setAdiantamentos([]);
    }
  }

  /** Saldo líquido atual de adiantamentos (positivo = cliente deve à empresa). */
  function calcularTotalAdiantamentosAtual() {
    if (!adiantamentos || adiantamentos.length === 0) return 0;
    return adiantamentos.reduce((total, adiantamento) => {
      const n = Number(adiantamento.valor);
      return total + (Number.isFinite(n) ? n : 0);
    }, 0);
  }

  async function buscarAdiantamentosAteDataCompra(clientId, dataCompra) {
    try {
      const dataFormatada = new Date(dataCompra).toISOString();
      const url = `${import.meta.env.VITE_URL}/advances/client/${clientId}/until-date?date=${dataFormatada}`;
      const response = await axios.get(url);
      setAdiantamentosAteDataCompra(response.data);
    } catch (error) {
      setAdiantamentosAteDataCompra([]);
    }
  }

  function calcularTotalAdiantamentosAteDataCompra() {
    if (!adiantamentosAteDataCompra || adiantamentosAteDataCompra.length === 0) {
      return 0;
    }

    const total = adiantamentosAteDataCompra.reduce((total, adiantamento) => {
      return total + adiantamento.valor;
    }, 0);

    return total;
  }

  function calculateTotals() {
    if (!purchases || !purchases.produtos || !Array.isArray(purchases.produtos)) {
      return { measures: {}, totalValue: 0 };
    }
    
    let measures = {};
    let totalValue = 0;

    purchases.produtos.forEach(produto => {
      if (!produto || !produto.produto) return;
      
      const medida = produto.produto.medida ? produto.produto.medida.toLowerCase() : 'un';
      const quantidade = Number(produto.quantity) || 0;
      const preco = Number(produto.price) || 0;
      
      if (!measures[medida]) {
        measures[medida] = 0;
      }
      measures[medida] += quantidade;
      
      totalValue += preco * quantidade;
    });

    return { measures, totalValue };
  }

  function formatMeasures(measures) {
    if (!measures || Object.keys(measures).length === 0) {
      return 'Nenhum produto';
    }
    
    return Object.entries(measures)
      .map(([medida, quantidade]) => {
        const medidaFormatada = medida.charAt(0).toUpperCase() + medida.slice(1);
        return `${quantidade} ${medidaFormatada}`;
      })
      .join(' / ');
  }

  function renderProducts() {
    const totals = calculateTotals();
    
    return (
      <>
        {purchases.produtos.map((produto, index) =>
           <Purchase key={index} className="report-product-row">
              <div className="left">
                <h5 className="cell-nome">{produto.produto?.nome}</h5>
                <h5 className="move cell-qtd">{produto.quantity} {produto.produto.medida}</h5>
                <h5 className="move cell-preco">{(produto.price).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
                <h5 className="move cell-total">{(produto.price * produto?.quantity).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
              </div>
           </Purchase>
        )}
        {purchases.produtos.length > 0 && (
          <Purchase className="total-row report-product-row">
            <div className="left">
              <h5 className="cell-nome">Total:</h5>
              <h5 className="move cell-qtd">{formatMeasures(totals.measures)}</h5>
              <h5 className="move cell-preco"></h5>
              <h5 className="move cell-total">{totals.totalValue.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
            </div>
          </Purchase>
        )}
      </>
    )
  }

  function renderInfo() {
    let result = [];

    for(let i = 0; i < purchases.valores.length;i++) {
      result.push(<Purchase key={i} className="report-payment-row">
      <div className="right">
        <h5 className="cell-valor">{purchases.valores[i].toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
        <h5 className="cell-forma">{purchases.formas[i]}</h5>
        <h5 className="detalhes cell-detalhes">{purchases.detalhes[i]}</h5>
      </div>
   </Purchase>)
    }
    return result;
  }

  function getPurchaseTotals() {
    if (!purchases || !purchases.produtos) {
      return { soma: 0, soma2: 0, saldo: 0, saldoFinal: 0 };
    }

    let soma = 0;
    let soma2 = 0;

    if (purchases.valores.length === 0) {
      soma2 = 0;
    } else {
      purchases.valores.forEach(value => {
        soma2 += value;
      });
    }

    purchases.produtos.forEach(e => {
      soma += e.price * e.quantity;
    });

    // Saldo da compra = produtos − pagamentos (igual ao status no backend).
    // Positivo = falta pagar na compra; negativo = crédito na compra.
    let saldo = soma - soma2;
    if (Math.abs(saldo) < 0.005) {
      saldo = 0;
    }

    // Saldo final inclui o saldo líquido de adiantamentos do cliente (após carregar /all).
    let saldoFinal = saldo;
    if (adiantamentos !== null) {
      const netAdv = calcularTotalAdiantamentosAtual();
      saldoFinal = saldo - netAdv;
      if (Math.abs(saldoFinal) < 0.005) {
        saldoFinal = 0;
      }
    }

    return { soma, soma2, saldo, saldoFinal };
  }

  function calculateTotal() {
    if (!purchases) return ["R$ 0,00", "R$ 0,00", "R$ 0,00"];

    const { soma, soma2, saldoFinal } = getPurchaseTotals();

    const saldoFinalFmt =
      adiantamentos !== null
        ? saldoFinal.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
        : '–';

    return [
      soma.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}),
      soma2.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}),
      saldoFinalFmt
    ];
  }

  function renderAdiantamentoAlert() {
    const totalAdiantamentos = calcularTotalAdiantamentosAteDataCompra();
    
    // Mostrar o ícone se há adiantamentos pendentes e não é exportação PDF
    if (totalAdiantamentos > 0 && !isPdfExport) {
      const tooltipText = `O cliente deve R$ ${totalAdiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, referente a adiantamentos`;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip 
            title={tooltipText}
            arrow
            placement="top"
          >
            <IconButton 
              size="small" 
              className="alert-icon"
              sx={{ 
                color: 'warning.main',
                '&:hover': {
                  backgroundColor: 'warning.light',
                  color: 'warning.contrastText'
                }
              }}
            >
              <Warning />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return null;
  }

  function handleOpenModal() {
    // Função removida
  }

  function handleCloseModal() {
    // Função removida
  }

  function handleConfirmAdiantamento() {
    // Função removida
  }

  async function processarAdiantamentosNoBackend(valor) {
    // Função removida
  }

  function renderAdiantamentoModal() {
    return null;
  }

  function handleExportPdf() {
    window.print();
  }

  return(
    <>
      <Container className="report-print">
        <Button
          className="hide-on-pdf"
          variant="contained"
          color="success"
          onClick={() => navigate(-1)}
          aria-label="Voltar para a página anterior"
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            color: '#fff',
            fontWeight: 600,
            textTransform: 'none',
            px: 2.5,
            py: 1,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          Voltar
        </Button>
        <IconButton
          className="hide-on-pdf"
          onClick={handleExportPdf}
          aria-label="Exportar relatório como PDF"
          sx={{
            position: 'fixed',
            top: 16,
            right: 24,
            zIndex: 1300,
            backgroundColor: 'primary.main',
            color: '#fff',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: 4,
            },
          }}
        >
          <PictureAsPdf />
        </IconButton>
        {info ? Header(info) : ""}
        <div className="organize">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <h1>RELATÓRIO DE COMPRA</h1>
            {renderAdiantamentoAlert()}
          </Box>
        </div>
        <div className="line"></div>
        <div className="organize report-meta">
          <h3 className="report-meta-supplier">
            Fornecedor: {purchases ? purchases.fornecedor : ''}
          </h3>
          <h3 className="report-meta-date">
            Data da compra:{' '}
            {purchases ? (new Date(purchases.data)).toLocaleDateString('pt-br') : ''}
          </h3>
        </div>
        <div className="line"></div>
        <div className="organize">
          <h4>
            DISCRIMINAÇÃO DE PRODUTOS
          </h4>
        </div>
        <div className="line"></div>
        <div className="info report-products-head">
          <h4>Nome</h4>
          <h4>qtd</h4>
          <h4>P. unit.</h4>
          <h4>Total</h4>
        </div>
        {
          purchases ? renderProducts() : ""
        }
        <div className="line"></div>
        <div className="organize">
          <h4>
            PAGAMENTOS LANÇADOS
          </h4>
        </div>
        <div className="line"></div>
        <div className="info report-payments-head">
          <h4>Valor</h4>
          <h4>Forma</h4>
          <h4>Detalhes</h4>
        </div>
        {
          purchases ? renderInfo() : ""
        }
        <div className="line"></div>
        <div className="footer">
          
          <h4 className="footer-summary footer-line">
            <span className="footer-label">Valor total dos produtos:</span>
            <span className="footer-value">{purchases ? calculateTotal()[0] : ''}</span>
          </h4>
          <div className="linefooter"></div>
          {calcularTotalAdiantamentosAteDataCompra() !== 0 && (
            <>
              <h4 className="footer-summary footer-line">
                <span className="footer-label">Adiantamentos pendentes:</span>
                <span className="footer-value footer-value--adiantamentos-pendentes">
                  {'- '}
                  {Math.abs(calcularTotalAdiantamentosAteDataCompra()).toLocaleString('pt-br', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </h4>
              <div className="linefooter"></div>
            </>
          )}
          <h4 className="footer-summary footer-line">
            <span className="footer-label">Quantia paga:</span>
            <span className="footer-value">{purchases ? calculateTotal()[1] : ''}</span>
          </h4>
          <div className="linefooter"></div>
          <h4 className="saldo-final-row footer-line">
            <strong>Saldo final:</strong>
            <span
              className={
                purchases &&
                adiantamentos !== null &&
                getPurchaseTotals().saldoFinal < 0
                  ? 'saldo-final-valor saldo-final-valor--negativo'
                  : 'saldo-final-valor'
              }
            >
              {purchases ? calculateTotal()[2] : ''}
            </span>
          </h4>
          <div className="linefooter"></div>
        </div>
      </Container>
      {renderAdiantamentoModal()}
    </>
  )
}