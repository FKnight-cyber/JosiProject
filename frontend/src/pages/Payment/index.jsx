import { Container } from "../ClienteRegister/style";
import { useEffect, useState } from "react";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

export default function Payment() {
  const [forma, setForma] = useState('');
  const [detalhe, setDetalhe] = useState('');
  const [valor, setValor] = useState(0);
  const [purchases, setPurchases] = useState();
  const [adiantamentoCriado, setAdiantamentoCriado] = useState(0);

  const navigate = useNavigate();

  const { purchaseId } = useParams();

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/purchases/${purchaseId}`);

    promise.then(res => {
      setPurchases(res.data);
    });
  },[]);

  function calculateTotal() {
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

    // Incluir o valor de adiantamentos no cálculo
    const valorAdiantamentos = purchases.valorAdiantamentos || 0;
    const valorTotalComAdiantamentos = soma + valorAdiantamentos;

    return (valorTotalComAdiantamentos - soma2).toFixed(2);
  }

  async function pay(event) {
    event.preventDefault();

    const body = {
      forma,
      detalhe,
      valor
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_URL}/purchases/${purchaseId}/update`, body);
      
      // Verificar se um adiantamento foi criado
      const valorRestante = parseFloat(calculateTotal()) - parseFloat(valor);
      if (valorRestante < 0) {
        const valorAdiantamento = Math.abs(valorRestante);
        setAdiantamentoCriado(valorAdiantamento);
        alert(`Pagamento registrado! Um adiantamento de R$ ${valorAdiantamento.toFixed(2)} foi criado automaticamente para o cliente.`);
      } else {
        alert("Pagamento registrado!");
      }
      
      navigate(-1);
    } catch (error) {
      alert("Falha ao registrar pagamento!");
    }
  }

  return(
    <Container>
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
              <strong>Valor restante após pagamento:</strong> R$ {(parseFloat(calculateTotal()) - parseFloat(valor)).toFixed(2)}
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
        <button type="submit">
          Efetuar Pagamento
        </button>
      </form>
    </Container>
  )
}