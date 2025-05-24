import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import AddAgentForm from '../../components/AddAgentForm';
import MembersTable from '../../components/MembersTable';
import Button from '../../components/Button';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns';

const ContentContainer = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h5`
  margin: 0;
  color: ${theme.colors.text.primary};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const StyledForm = styled(Form)`
  min-width: 250px;
`;

const DateFilterContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
  margin-left: ${theme.spacing.md};
`;

const DateButton = styled(Button)`
  &.active {
    background-color: ${theme.colors.primary};
    color: white;
  }
`;

const TirumallaAdmin = () => {
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await api.get('/agent');
      return response.data.data;
    },
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members', selectedAgentId, dateFilter, startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/member');
      let allMembers = response.data.data;

      // Filter by agent
      if (selectedAgentId) {
        allMembers = allMembers.filter(
          (member) => member.agent === selectedAgentId
        );
      }

      // Filter by date
      if (dateFilter !== 'all') {
        const now = new Date();
        let start, end;

        switch (dateFilter) {
          case 'today':
            start = startOfDay(now);
            end = endOfDay(now);
            break;
          case 'week':
            start = startOfWeek(now);
            end = endOfWeek(now);
            break;
          case 'month':
            start = startOfMonth(now);
            end = endOfMonth(now);
            break;
          case 'custom':
            if (startDate && endDate) {
              start = startOfDay(new Date(startDate));
              end = endOfDay(new Date(endDate));
            }
            break;
          default:
            return allMembers;
        }

        allMembers = allMembers.filter((member) => {
          const memberDate = new Date(member.createdAt);
          return memberDate >= start && memberDate <= end;
        });
      }

      return allMembers;
    },
    enabled: true,
  });

  const handleAgentCreated = () => {
    setShowAddAgent(false);
  };

  const handleAgentChange = (event) => {
    setSelectedAgentId(event.target.value);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <DashboardLayout title='Tirumalla Admin Dashboard'>
      <ContentContainer>
        <HeaderContainer>
          <SectionTitle>All Members</SectionTitle>
          <Button variant='primary' onClick={() => setShowAddAgent(true)}>
            Add New Agent
          </Button>
        </HeaderContainer>

        <FilterContainer>
          <StyledForm>
            <Form.Group>
              <Form.Label>Filter by Agent</Form.Label>
              <Form.Select
                value={selectedAgentId}
                onChange={handleAgentChange}
                disabled={isLoadingAgents}
              >
                <option value=''>All Agents</option>
                {agents?.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </StyledForm>

          <DateFilterContainer>
            <Form.Label>Filter by Date:</Form.Label>
            <DateButton
              variant={dateFilter === 'today' ? 'primary' : 'outline-primary'}
              onClick={() => handleDateFilterChange('today')}
            >
              Today
            </DateButton>
            <DateButton
              variant={dateFilter === 'week' ? 'primary' : 'outline-primary'}
              onClick={() => handleDateFilterChange('week')}
            >
              This Week
            </DateButton>
            <DateButton
              variant={dateFilter === 'month' ? 'primary' : 'outline-primary'}
              onClick={() => handleDateFilterChange('month')}
            >
              This Month
            </DateButton>
            <DateButton
              variant={dateFilter === 'custom' ? 'primary' : 'outline-primary'}
              onClick={() => handleDateFilterChange('custom')}
            >
              Custom Range
            </DateButton>
          </DateFilterContainer>

          {dateFilter === 'custom' && (
            <DateRangeContainer>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </DateRangeContainer>
          )}
        </FilterContainer>

        {isLoadingMembers ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <LoadingSpinner />
          </div>
        ) : (
          <MembersTable data={members || []} isLoading={isLoadingMembers} />
        )}

        <AddAgentForm
          isOpen={showAddAgent}
          onClose={() => setShowAddAgent(false)}
          onSuccess={handleAgentCreated}
          componentId='tirumalla-agent'
        />
      </ContentContainer>
    </DashboardLayout>
  );
};

export default TirumallaAdmin;
