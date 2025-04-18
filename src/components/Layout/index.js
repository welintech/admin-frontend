import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.secondary.main};
  display: flex;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: ${theme.colors.secondary.light};
  position: fixed;
  height: 100vh;
  padding: ${theme.spacing.md};
  box-shadow: ${theme.shadows.md};
`;

const MainContent = styled.div`
  margin-left: 250px;
  padding: ${theme.spacing.xl};
  flex: 1;
`;

const NavItem = styled.a`
  display: block;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: ${theme.spacing.xs};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${theme.colors.secondary.main};
    color: ${theme.colors.text.primary};
  }

  &.active {
    background-color: ${theme.colors.primary.light};
    color: ${theme.colors.primary.main};
  }
`;

const Layout = ({ children }) => {
  return <LayoutContainer>{children}</LayoutContainer>;
};

Layout.Sidebar = ({ children }) => {
  return <Sidebar>{children}</Sidebar>;
};

Layout.Main = ({ children }) => {
  return <MainContent>{children}</MainContent>;
};

Layout.NavItem = ({ children, ...props }) => {
  return <NavItem {...props}>{children}</NavItem>;
};

export default Layout;
