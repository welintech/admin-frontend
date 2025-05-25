import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Form } from 'react-bootstrap';
import api from '../api';
import MembersTable from '../components/MembersTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import DashboardLayout from '../components/DashboardLayout';
import AddVendorForm from '../components/AddVendorForm';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
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

const AdminDashboard = () => {
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddVendor, setShowAddVendor] = useState(false);

  const { data: vendors, isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/admin/vendor');
      return response.data.data;
    },
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['members', selectedVendorId, dateFilter, startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/member');
      let allMembers = response.data.data;

      // Filter by vendor
      if (selectedVendorId) {
        allMembers = allMembers.filter(
          (member) => member.vendorId._id === selectedVendorId
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
          const memberDate = parseISO(member.createdAt);
          return memberDate >= start && memberDate <= end;
        });
      }

      return allMembers;
    },
    enabled: true,
  });

  const handleVendorChange = (event) => {
    setSelectedVendorId(event.target.value);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <DashboardLayout title='Admin Dashboard'>
      <ContentContainer>
        <HeaderContainer>
          <SectionTitle>All Members</SectionTitle>
          <Button variant='primary' onClick={() => setShowAddVendor(true)}>
            Add New Vendor
          </Button>
        </HeaderContainer>

        <FilterContainer>
          <StyledForm>
            <Form.Group>
              <Form.Label>Filter by Vendor</Form.Label>
              <Form.Select
                value={selectedVendorId}
                onChange={handleVendorChange}
                disabled={isLoadingVendors}
              >
                <option value=''>All Vendors</option>
                {vendors?.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
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

        <AddVendorForm
          show={showAddVendor}
          onHide={() => setShowAddVendor(false)}
        />
      </ContentContainer>
    </DashboardLayout>
  );
};

export default AdminDashboard;
