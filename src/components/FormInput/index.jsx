import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const InputContainer = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text.primary};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.secondary.dark};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.body.fontSize};
  transition: border-color 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${theme.colors.primary.light};
  }

  &:disabled {
    background-color: ${theme.colors.secondary.main};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.error.main};
  font-size: 0.875rem;
  margin-top: ${theme.spacing.xs};
  display: block;
`;

const FormInput = ({ label, error, ...props }) => {
  return (
    <InputContainer>
      {label && <Label>{label}</Label>}
      <Input {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default FormInput;
