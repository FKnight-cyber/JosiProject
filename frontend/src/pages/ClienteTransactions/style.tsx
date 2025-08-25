import styled from "styled-components/macro";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow-y: scroll;
  padding: 60px;

  h1 {
    font-size: 20px;
    font-weight: bolder;
  }

  .voltar {
    position: absolute;
    top: 2px;
    left: 2px;
  }

  .transactions {
    margin-top: 20px;
    width: 100%;
    min-height: 400px;
    padding: 20px;
    border-radius: 8px;
  }

  .transaction {
    margin-bottom: 6px;
  }
`