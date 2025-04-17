import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
function HomePage() {
  return (
    <Container>
      <h1>Home Page</h1>
    </Container>
  );
}

export default HomePage;
