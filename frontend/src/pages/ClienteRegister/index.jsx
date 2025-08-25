import { useState } from "react";
import { Container } from "./style";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function ClienteRegister() {
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [pix, setPix] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const navigate = useNavigate();

  async function addClient(event) {
    event.preventDefault();

    const body = {
      name,
      telefone,
      pix,
      cpf,
      cnpj,
      rua,
      bairro,
      cep,
      cidade,
      estado
    }

    try {
      await axios.post(`${import.meta.env.VITE_URL}/register`, body);
      alert("Sucesso!");
      navigate('/');
    } catch (error) {
      console.error('Erro completo:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', error.response.data);
        
        if (error.response.status === 422) {
          const errorMessages = error.response.data;
          if (Array.isArray(errorMessages)) {
            alert(`Erros de validação:\n${errorMessages.join('\n')}`);
          } else {
            alert(`Erro de validação: ${errorMessages}`);
          }
        } else {
          alert(`Erro ${error.response.status}: ${error.response.data}`);
        }
      } else if (error.request) {
        alert("Erro de conexão: Não foi possível conectar ao servidor");
      } else {
        alert(`Erro: ${error.message}`);
      }
    }
  }

  return(
    <Container>
      <div className="voltar" onClick={() => navigate('/')}>
        <IoArrowBackCircleSharp color="crimson" size={60} />
      </div>
      <form onSubmit={addClient}>
        <input type="text"
          value={name}
          placeholder="Nome"
          onChange={e => setName(e.target.value)}
        />
        <input type="text"
          value={telefone}
          placeholder="Telefone"
          onChange={e => setTelefone(e.target.value)}
        />
        <input type="text"
          value={pix}
          placeholder="PIX"
          onChange={e => setPix(e.target.value)}
        />
        <input type="text"
          value={cpf}
          placeholder="CPF"
          onChange={e => setCpf(e.target.value)}
        />
        <input type="text"
          value={cnpj}
          placeholder="CNPJ"
          onChange={e => setCnpj(e.target.value)}
        />
        <input type="text"
          value={rua}
          placeholder="Rua"
          onChange={e => setRua(e.target.value)}
        />
        <input type="text"
          value={bairro}
          placeholder="Bairro"
          onChange={e => setBairro(e.target.value)}
        />
        <input type="text"
          value={cep}
          placeholder="CEP"
          onChange={e => setCep(e.target.value)}
        />
        <input type="text"
          value={cidade}
          placeholder="Cidade"
          onChange={e => setCidade(e.target.value)}
        />
        <input type="text"
          value={estado}
          placeholder="Estado"
          onChange={e => setEstado(e.target.value)}
        />
        <button type="submit">
          Cadastrar Cliente
        </button>
      </form>
    </Container>
  )
}