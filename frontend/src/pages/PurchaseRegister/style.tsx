import styled from "styled-components/macro";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #ffffff;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: relative;

  form {
    height: 80vh;
    width: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow-y: auto;
    margin: 0;

    input {
      width: 100%;
      height: 40px;
      padding-left: 6px;
      font-size: 16px;
      margin-bottom: 6px;
    }

    .opcoes {
      display: flex;
      flex-wrap: wrap;
      width: 90%;
      min-height: 70%;
      overflow-y: scroll;

      label {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-width: 180px;
        min-height: 120px;

        white-space: nowrap;
        overflow: hidden;  
        text-overflow: ellipsis;
      }
    }
  }

  .voltar {
    position: absolute;
    top: 12px;
    left: 12px;
    cursor: pointer;
  }

  .fields {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    margin-bottom: 8px;
    input {
      width: 200px;
    }
  }

  .opcoes {
    display: flex;
    width: 100%;
    border: 2px solid black;
    min-height: 120px;
    align-items: center;
    padding-left: 12px;
  }

  .item {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
  }

  .confirmation {
    width: 60%;
    height: 60vh;
    border: solid 4px #000;
    padding: 12px;
    overflow-y: scroll;
  }

  button {
      height: 60px;
      width: 50%;
      margin-top: 6px;
      background-color: #bff080;
      color: #000000;
      font-size: 20px;
      cursor: pointer;
    }

  button.cancel {
    background-color: crimson;
  }

  .search {
    flex-direction: row;
    position: absolute;
    width: 400px;
    height: 50px;
    top: 10px;
  }
`