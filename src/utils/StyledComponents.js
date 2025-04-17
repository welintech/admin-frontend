import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f2f2f2;
  width: 100vw;
  color: black;
`;

export const FlexContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Button = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.active === "true" ? "blue" : "gray")};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.active ? "#004494" : "#0056b3"}; /* Darker shade on hover */
  }
`;

export const StyledInput = styled.input`
  width: max-content;
  background-color: white;
  color: black;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  &:focus {
    border-color: #f2f2f2;
    outline: none;
  }
`;
