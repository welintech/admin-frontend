import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const ButtonBase = styled.button`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.body.fontSize};
  font-weight: 600;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 77, 64, 0.2);
  }
`;

const PrimaryButton = styled(ButtonBase)`
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.text.light};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.primary.dark};
  }
`;

const OutlinePrimaryButton = styled(ButtonBase)`
  background-color: transparent;
  color: ${theme.colors.primary.main};
  border-color: ${theme.colors.primary.main};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.primary.main};
    color: ${theme.colors.text.light};
  }
`;

const SecondaryButton = styled(ButtonBase)`
  background-color: ${theme.colors.secondary.main};
  color: ${theme.colors.text.primary};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.secondary.dark};
  }
`;

const OutlineSecondaryButton = styled(ButtonBase)`
  background-color: transparent;
  color: ${theme.colors.secondary.main};
  border-color: ${theme.colors.secondary.main};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.secondary.main};
    color: ${theme.colors.text.primary};
  }
`;

const DangerButton = styled(ButtonBase)`
  background-color: ${theme.colors.error.main};
  color: ${theme.colors.text.light};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.error.light};
  }
`;

const OutlineDangerButton = styled(ButtonBase)`
  background-color: transparent;
  color: ${theme.colors.error.main};
  border-color: ${theme.colors.error.main};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.error.main};
    color: ${theme.colors.text.light};
  }
`;

const Button = ({ variant = 'primary', children, ...props }) => {
  const ButtonComponent = {
    primary: PrimaryButton,
    'outline-primary': OutlinePrimaryButton,
    secondary: SecondaryButton,
    'outline-secondary': OutlineSecondaryButton,
    danger: DangerButton,
    'outline-danger': OutlineDangerButton,
  }[variant];

  return <ButtonComponent {...props}>{children}</ButtonComponent>;
};

export default Button;
