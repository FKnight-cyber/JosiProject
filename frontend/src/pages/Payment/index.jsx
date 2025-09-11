import { Container } from "../ClienteRegister/style";
import { useEffect, useState } from "react";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { CircularProgress, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

export default function Payment() {
  const [forma, setForma] = useState('');
  const [detalhe, setDetalhe] = useState('');
  const [valor, setValor] = useState(0);
  const [purchases, setPurchases] = useState();
  const [adiantamentoCriado, setAdiantamentoCriado] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPurchase, setIsLoadingPurchase] = useState(true);

  const navigate = useNavigate();
  const { purchaseId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/purchases/${purchaseId}`);

    promise.then(res => {
      setPurchases(res.data);
      
      // Não mostrar notificação de sucesso para carregamento de dados
      // Apenas mostrar notificações para ações do usuário
    }).catch(error => {
      enqueueSnackbar('Erro ao carregar dados da compra', { variant: 'error' });
    }).finally(() => {
      setIsLoadingPurchase(false);
    });
  },[]);

  function calculateTotalReal() {
    let soma = 0;
    let soma2 = 0;

    if(purchases.valores.length === 0) {
      soma2 = 0;
    }else {
      purchases.valores.map(value => {
        soma2 += value;
      })
    }

    purchases.produtos.map(e => {
      soma += e.price * e.quantity;
    });

    // Calcular valor restante: produtos - pagamentos
    // Os adiantamentos já estão incluídos nos pagamentos (forma "Débito Automático")
    const valorRestante = soma - soma2;

    return valorRestante.toFixed(2);
  }

  function calculateTotal() {
    // Retornar o valor absoluto para exibição
    return Math.abs(parseFloat(calculateTotalReal())).toFixed(2);
  }

  function calculateRemainingAfterPayment(paymentValue) {
    const currentRemaining = parseFloat(calculateTotalReal());
    const remainingAfterPayment = currentRemaining - parseFloat(paymentValue);
    
    // Se o resultado for negativo, significa que será criado um adiantamento
    // Se for positivo, é o valor que ainda falta pagar
    return Math.max(0, remainingAfterPayment).toFixed(2);
  }

  async function pay(event) {
    event.preventDefault();
    setIsLoading(true);

    const body = {
      forma,
      detalhe,
      valor
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_URL}/purchases/${purchaseId}/update`, body);
      
      // Verificar se um adiantamento foi criado
      const valorRestanteAtual = parseFloat(calculateTotalReal()) - parseFloat(valor);
      if (valorRestanteAtual < 0) {
        const valorAdiantamento = Math.abs(valorRestanteAtual);
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
      
          {/* Mensagem informativa sobre adiantamento */}
          {purchases && valor > 0 && (
            <div style={{ 
              margin: '10px 0', 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '5px',
              border: '1px solid #2196f3'
            }}>
              {parseFloat(valor) > parseFloat(calculateTotal()) ? (
                <p style={{ margin: 0, color: '#1976d2' }}>
                  <strong>Informação:</strong> Como o valor do pagamento (R$ {parseFloat(valor).toFixed(2)}) 
                  é maior que o valor da conta (R$ {calculateTotal()}), um adiantamento de 
                  R$ {(parseFloat(valor) - parseFloat(calculateTotal())).toFixed(2)} será criado automaticamente para o cliente.
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
            <input type="number"
              value={valor}
              placeholder="Quantia"
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