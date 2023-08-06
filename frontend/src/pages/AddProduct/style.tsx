import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;

  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid black;
    width: 30%;
    height: 30%;
    padding: 8px;

    form {
      display: flex;
      flex-direction: column;

      input {
        height: 40px;
        font-size: 18px;
        margin-bottom: 12px;
        padding-left: 6px;
      }

      button {
        height: 60px;
        margin-top: 12px;
        font-size: 20px;
      }

      label {
        margin-right: 8px;
      }
    }

    h1 {
      font-size: 16px;
      font-weight: bolder;
      margin-bottom: 8px;
    }
  }
`