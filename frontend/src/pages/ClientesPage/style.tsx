import styled from "styled-components/macro";

export const Container = styled.div`
  height: 100vh;
  width: 100%;
  padding: 40px 0 20px 60px;
  background-color: #ffffff;
  display: flex;
  flex-wrap: wrap;
  position: relative;

  overflow-y: scroll;

  .title {
    position: absolute;
    top: 6px;
    left: 50%;
  }

  .voltar {
    position: absolute;
    top: 2px;
    left: 2px;
    cursor: pointer;
  }
`