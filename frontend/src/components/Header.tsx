import styled from "styled-components/macro";

export default function Header(props) {
  return(
    <Container>
      <div className="left">
        <img src="http://jornalcobaia.com.br/wp-content/uploads/2019/10/reciclagem.png" alt="logo" />
        <div className="left2">
          <h1>{props.name}</h1>
          <h2>{props.description}</h2>
        </div>
      </div>
      <div className="right">
          <h2>{props.rua}</h2>
          <h2>Bairro: {props.bairro} - CEP: {props.cep}</h2>
          <h2>{props.cidade}/{props.estado}</h2>
          <h2>Fone: {props.telefone}</h2>
          <h2>PH ESCOBAR TORRES LTDA. - CNPJ: {props.cnpj}</h2>
      </div>
    </Container>
  )
}

const Container = styled.div`
  height: 20vh;
  width: 100%;
  border: solid 2px #000000;
  display: flex;
  justify-content: space-around;
  align-items: center;

  img {
    height: 80px;
    width: 80px;
    object-fit: cover;
  }

  .left, .left2 {
    display: flex;
  }

  .left2 {
    flex-direction: column;
    justify-content: space-around;
    height: 80px;
    margin-left: 12px;

    h1 {
      font-weight: bolder;
    }
  }

  .right {
    h2 {
      margin-bottom: 8px;
    }
  }
`