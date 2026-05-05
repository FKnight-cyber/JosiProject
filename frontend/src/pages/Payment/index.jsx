import { Container } from "../ClienteRegister/style";
import { useEffect, useState } from "react";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { CircularProgress, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

/** Centavos consistentes — evita sobras tipo 0,01 / 1,00 por float e alinha totais ao backend */
function roundBRL(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

/**
 * Interpreta valor digitado (aceita "10,50", "1.234,56"; Number("10,50") é NaN sem isso).
 */
function parseMoneyInput(raw) {
  if (raw === '' || raw == null) return 0;
  let s = String(raw).trim();
  if (s === '') return 0;
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  const n = parseFloat(s);
  return roundBRL(Number.isFinite(n) ? n : 0);
}

export default function Payment() {
  const [forma, setForma] = useState('');
  const [detalhe, setDetalhe] = useState('');
  const [valor, setValor] = useState('');
  const [purchases, setPurchases] = useState();
  const [adiantamentoCriado, setAdiantamentoCriado] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPurchase, setIsLoadingPurchase] = useState(true);

  const navigate = useNavigate();
  const { purchaseId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  /** Saldo em aberto (pode ser negativo se houver crédito/overpay teórico antes do último pagamento) */
  function getRemainingBRL() {
    if (!purchases) return 0;

    const produtos = purchases.produtos || [];
    const valores = purchases.valores || [];

    const produtosTotal = roundBRL(
      purchases.valorTotal != null && purchases.valorTotal !== undefined
        ? purchases.valorTotal
        : produtos.reduce((s, p) => s + Number(p.price) * Number(p.quantity), 0)
    );

    const totalPagamentos = roundBRL(valores.reduce((sum, v) => sum + Number(v), 0));

    return roundBRL(produtosTotal - totalPagamentos);
  }

  /** Valor que ainda falta pagar (nunca negativo na UI principal) */
  function calculateTotal() {
    if (!purchases) return '';
    const owed = Math.max(0, getRemainingBRL());
    return owed.toFixed(2);
  }

  function calculateRemainingAfterPayment(paymentValue) {
    const pay = parseMoneyInput(paymentValue);
    const currentRemaining = getRemainingBRL();
    const remainingAfterPayment = roundBRL(currentRemaining - pay);
    return Math.max(0, remainingAfterPayment).toFixed(2);
  }

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/purchases/${purchaseId}`);

    promise.then(res => {
      setPurchases(res.data);
    }).catch(error => {
      enqueueSnackbar('Erro ao carregar dados da compra', { variant: 'error' });
    }).finally(() => {
      setIsLoadingPurchase(false);
    });
  }, [purchaseId]);

  async function pay(event) {
    event.preventDefault();
    setIsLoading(true);

    const valorNumerico = parseMoneyInput(valor);

    const body = {
      forma,
      detalhe,
      valor: valorNumerico
    };

    try {
      await axios.put(`${import.meta.env.VITE_URL}/purchases/${purchaseId}/update`, body);

      const remainingBefore = getRemainingBRL();
      const valorRestanteAtual = roundBRL(remainingBefore - valorNumerico);

      if (valorRestanteAtual < 0) {
        const valorAdiantamento = roundBRL(Math.abs(valorRestanteAtual));
        setAdiantamentoCriado(valorAdiantamento);
        enqueueSnackbar(`Pagamento registrado! Um adiantamento de R$ ${valorAdiantamento.toFixed(2)} foi criado automaticamente para o cliente.`, { variant: 'success' });
      } else {
        enqueueSnackbar("Pagamento registrado com sucesso!", { variant: 'success' });
      }

      navigate(-1);
    } catch (error) {
      enqueueSnackbar("Falha ao registrar pagamento!", { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  const valorPago = parseMoneyInput(valor);
  const restanteConta = purchases ? getRemainingBRL() : 0;
  const totalExibido = purchases ? parseFloat(calculateTotal()) : 0;
  const mostrarPreviewPagamento = purchases && valorPago > 0;

  return(
    <Container>
      {isLoadingPurchase ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} />
          <span style={{ fontSize: '18px', color: '#666' }}>Carregando dados da compra...</span>
        </Box>
      ) : (
        <>
          <div className="voltar" onClick={() => navigate(-1)}>
            <IoArrowBackCircleSharp color="crimson" size={60} />
          </div>
          
          <h1>Valor desta conta: R$ {purchases ? calculateTotal() : ""}</h1>
      
          {mostrarPreviewPagamento && (
            <div style={{ 
              margin: '10px 0', 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '5px',
              border: '1px solid #2196f3'
            }}>
              {valorPago > totalExibido ? (
                <p style={{ margin: 0, color: '#1976d2' }}>
                  <strong>Informação:</strong> Como o valor do pagamento (R$ {valorPago.toFixed(2)}) 
                  é maior que o valor da conta (R$ {calculateTotal()}), um adiantamento de 
                  R$ {roundBRL(valorPago - restanteConta).toFixed(2)} será criado automaticamente para o cliente.
                </p>
              ) : (
                <p style={{ margin: 0, color: '#1976d2' }}>
                  <strong>Valor restante após pagamento:</strong> R$ {calculateRemainingAfterPayment(valor)}
                </p>
              )}
            </div>
          )}
          
          <form onSubmit={pay}>
            <input type="text"
              value={forma}
              placeholder="Forma de pagamento"
              onChange={e => setForma(e.target.value)}
            />
            <input type="text"
              value={detalhe}
              placeholder="Detalhes da transação"
              onChange={e => setDetalhe(e.target.value)}
            />
            <input
              type="text"
              inputMode="decimal"
              value={valor}
              placeholder="Quantia (ex: 10,50)"
              onChange={e => setValor(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <span>Processando...</span>
                </Box>
              ) : (
                'Efetuar Pagamento'
              )}
            </button>
          </form>
        </>
      )}
    </Container>
  )
}
