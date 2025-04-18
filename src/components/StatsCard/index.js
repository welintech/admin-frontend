import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const CardContainer = styled.div`
  background: ${theme.colors.secondary.light};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const Title = styled.h3`
  font-size: ${theme.typography.body.fontSize};
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

const Value = styled.p`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ color }) => color || theme.colors.primary.main};
`;

const StatsCard = ({ title, value, color, icon: Icon }) => {
  return (
    <CardContainer>
      <Title>{title}</Title>
      <Value color={color}>{value}</Value>
      {Icon && <Icon size={24} style={{ marginTop: theme.spacing.sm }} />}
    </CardContainer>
  );
};

export default StatsCard;
