import styled from "styled-components/macro";

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-y: scroll;

  .organize {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    position: relative;

    h3 {
      margin-right: 240px;
    }
  }

  h1 {
    justify-content: center;
    font-size: 22px;
    font-weight: bolder;
  }

  h4 {
    font-size: 18px;
    font-weight: bolder;
  }

  .line {
    width: 100%;
    height: 2px;
    background-color: #000;
  }

  .info {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .info.sub {
    width: 50%;
  }

  .footer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-top: 10px;
    padding-right: 20px;

    h4 {
      width: 340px;
      text-align: start;
    }
  }

  .linefooter {
    width: 340px;
    height: 2px;
    background-color: #000;
    margin-top: 6px;
    margin-bottom: 6px;
  }

  /* Estilos para o ícone de alerta */
  .alert-icon {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Estilos para ocultar elementos durante impressão/PDF */
  @media print {
    .alert-icon,
    .adiantamento-button {
      display: none !important;
    }
  }

  /* Classe para elementos que devem ser ocultos na exportação PDF */
  .hide-on-pdf {
    @media print {
      display: none !important;
    }
  }
`

export const Purchase = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 12px;
  height: auto;
  width: 100%;
  padding: 20px;
  margin-bottom: 2px;

  &.total-row {
    border-top: 2px solid #000;
    font-weight: bold;
    background-color: #f5f5f5;
    height: auto;
    min-height: 12px;
    
    .left {
      h5 {
        font-weight: bold;
        
        &.move {
          font-weight: bold;
        }
      }
    }
  }

  .left {
    display: flex;
    justify-content: space-between;
    width: 100%;

    h5 {
      width: 14.2%;
    }

    .move {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }
  }

  .right {
    display: flex;
    justify-content: space-between;
    width: 50%;
  }

  .detalhes {
    width: 300px;
    min-height: 26px;
    height: auto;
    word-wrap: break-word;
    overflow: visible;
    white-space: normal;
    line-height: 1.2;
  }
`