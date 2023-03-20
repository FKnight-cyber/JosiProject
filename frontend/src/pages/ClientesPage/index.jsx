import { useEffect, useState } from "react"
import axios from "axios";
import { Container } from "./style";
import Clientes from "../../components/Cliente";
import { useNavigate } from "react-router-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";

export default function ClientesPage() {
  const [clients, setClients] = useState();
  const [client, setClient] = useState({});
  const [name, setName] = useState('');
  const [changeState, setChangeState] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients`);

    promise.then(res => {
      setClient({});
      setClients(res.data);
    })
  },[changeState]);

  async function findByName(event) {
    event.preventDefault();

    try {
      if(!name) {
        setChangeState(changeState + 1);
        return;
      }

      const { data:client } = await axios.get(`${import.meta.env.VITE_URL}/clients?name=${name}`);
      const arr = [];

      arr.push(client);

      setClient(...arr);
    } catch (error) {
      alert(error);
    }
  }

  return(
    <Container>
      <div className="title">
        <h1>Clientes</h1>
        <form onSubmit={findByName}>
          <input type="text"
            placeholder="Procurar"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </form>
      </div>
      <div className="voltar" onClick={() => navigate('/')}>
        <IoArrowBackCircleSharp color="crimson" size={60} />
      </div>
      {
        clients && Object.keys(client).length === 0 ? Clientes(clients, setChangeState, changeState) : ""
      }
      {
        Object.keys(client).length !== 0 ? Clientes(client) : ""
      }
    </Container>
  )
}
