import styled from "styled-components/macro";
import { IoBrush, IoClose } from "react-icons/io5";
import axios from "axios";
import { Link } from "react-router-dom";

type ProdutosProps = {
  items: unknown[] | undefined | null;
  onInvalidate: () => void;
};

export default function Produtos({ items, onInvalidate }: ProdutosProps) {
  async function deleteProduto(id: number) {
    try {
      await axios.delete(`${import.meta.env.VITE_URL}/products/${id}/delete`);
      onInvalidate();
      alert("Produto desativado. Ele não aparecerá mais na listagem.");
    } catch (error) {
      alert(error);
    }
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      {items.map((produto: any, index: number) => (
        <Container key={produto.id ?? index}>
          <h1>
            Nome: {produto.nome} ({produto.medida})
          </h1>
          <p className="active-flag">Ativo: {produto.active === false ? "Não" : "Sim"}</p>
          <div className="options">
            <Link to={`/products/update/${produto.id}`}>
              <IoBrush color="purple" size={20} cursor="pointer" />
            </Link>
            <IoClose color="red" size={20} cursor="pointer" onClick={() => deleteProduto(produto.id)} />
          </div>
        </Container>
      ))}
    </>
  );
}

export const Container = styled.div`
  border: solid 2px #000;
  width: 240px;
  height: 80px;
  background-color: #ebecf0;
  padding: 6px;
  margin: 4px;
  overflow-y: scroll;

  position: relative;

  h1 {
    margin: 6px;
    font-size: 16px;
    word-wrap: break-word;
  }

  .active-flag {
    margin: 2px 6px 0;
    font-size: 12px;
    color: #2e7d32;
  }

  .options {
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: 8px;
    right: 8px;

    height: 60px;

    justify-content: space-around;
  }
`;
