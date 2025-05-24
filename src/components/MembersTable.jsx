import React, { useMemo, useState } from 'react';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import { Table, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
} from 'react-icons/fa';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const TableContainer = styled.div`
  .table {
    margin-bottom: 0;
  }

  .table th {
    background-color: #f8f9fa;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  .table th:hover {
    background-color: #e9ecef;
  }

  .table td {
    vertical-align: middle;
  }

  .sort-icon {
    margin-left: 5px;
  }

  .expand-button {
    background: none;
    border: none;
    padding: 0;
    color: #6c757d;
    cursor: pointer;
    &:hover {
      color: #495057;
    }
  }

  .product-details {
    background-color: #f8f9fa;
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 4px;
  }

  .product-card {
    background: white;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;
  max-width: 300px;
`;

const ProductCard = styled.div`
  background: white;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
`;

const ProductTitle = styled.h6`
  margin: 0;
  color: #2c3e50;
  text-transform: capitalize;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${(props) => {
    switch (props.$status) {
      case 'active':
        return '#d4edda';
      case 'pending':
        return '#fff3cd';
      default:
        return '#e9ecef';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'active':
        return '#155724';
      case 'pending':
        return '#856404';
      default:
        return '#495057';
    }
  }};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  .label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
  }
  .value {
    font-weight: 500;
    color: #2c3e50;
  }
`;

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatProductType = (type) => {
  if (!type) return '-';
  return type.replace(/([A-Z])/g, ' $1').toLowerCase();
};

const LoneCoverDetails = ({ details }) => {
  return (
    <DetailGrid>
      <DetailItem>
        <div className='label'>Loan Amount</div>
        <div className='value'>{formatCurrency(details.loanAmount)}</div>
      </DetailItem>
      <DetailItem>
        <div className='label'>Coverage Period</div>
        <div className='value'>
          {formatDate(details.coverageStartDate)} -{' '}
          {formatDate(details.coverageEndDate)}
        </div>
      </DetailItem>
      <DetailItem>
        <div className='label'>Base Premium</div>
        <div className='value'>{formatCurrency(details.basePremium)}</div>
      </DetailItem>
      <DetailItem>
        <div className='label'>GST</div>
        <div className='value'>{formatCurrency(details.gst)}</div>
      </DetailItem>
      <DetailItem>
        <div className='label'>Total Premium</div>
        <div className='value'>{formatCurrency(details.totalPremium)}</div>
      </DetailItem>
      <DetailItem>
        <div className='label'>Payment Status</div>
        <div className='value'>
          <StatusBadge $status={details.payment?.status}>
            {details.payment?.status || 'N/A'}
          </StatusBadge>
        </div>
      </DetailItem>
    </DetailGrid>
  );
};

const ActionButton = styled(Button)`
  background: transparent;
  border: none;
  padding: 0.25rem;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    color: #495057;
    background-color: #f8f9fa;
  }
  &:focus {
    box-shadow: none;
    background-color: transparent;
  }
  &:active {
    background-color: transparent;
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  right: 1rem;
  top: 1rem;
  z-index: 1;
`;

const ActionDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 2;
`;

const ActionItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #495057;
  cursor: pointer;
  text-align: left;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const PaymentStatusModal = ({ show, onHide, product, onSuccess }) => {
  const [transactionId, setTransactionId] = useState('');
  const queryClient = useQueryClient();

  const addPayment = useMutation({
    mutationFn: async (transactionId) => {
      const response = await api.post('/payments/success', {
        transactionId,
        amount: product.details?.totalPremium || 0,
        product: {
          type: product.type,
          productId: product.details?._id,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment details added successfully');
      onSuccess();
      onHide();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to add payment details'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPayment.mutate(transactionId);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add Payment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className='mb-3'>
            <Form.Label>Transaction ID</Form.Label>
            <Form.Control
              type='text'
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder='Enter transaction ID'
              required
            />
          </Form.Group>
          <div className='d-flex justify-content-end gap-2'>
            <Button variant='secondary' onClick={onHide}>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={addPayment.isPending}
            >
              {addPayment.isPending ? 'Adding...' : 'Add Payment'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const ProductActions = ({ product, onPaymentUpdate }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (user?.role?.role !== 'admin') return null;

  const isPaymentCompleted =
    product.details?.payment?.status === 'completed' ||
    product.details?.payment?.status === 'paid';

  return (
    <ActionMenu>
      <ActionButton onClick={() => setShowMenu(!showMenu)}>
        <FaEllipsisV />
      </ActionButton>
      {showMenu && (
        <ActionDropdown>
          {!isPaymentCompleted && (
            <ActionItem
              onClick={() => {
                setShowPaymentModal(true);
                setShowMenu(false);
              }}
            >
              Add Payment
            </ActionItem>
          )}
          {/* Add more actions here in the future */}
        </ActionDropdown>
      )}
      <PaymentStatusModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        product={product}
        onSuccess={onPaymentUpdate}
      />
    </ActionMenu>
  );
};

const ProductDetails = ({ memberId }) => {
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['member-products', memberId],
    queryFn: async () => {
      const response = await api.get(`/member/${memberId}/products`);
      return response.data.data;
    },
    enabled: !!memberId,
  });

  const queryClient = useQueryClient();

  const handlePaymentUpdate = () => {
    queryClient.invalidateQueries(['member-products', memberId]);
  };

  if (isLoadingProducts) {
    return <div key='loading'>Loading products...</div>;
  }

  if (!products?.length) {
    return <div key='no-products'>No products found</div>;
  }

  const renderProductDetails = (product) => {
    switch (product.type) {
      case 'loneCover':
        return <LoneCoverDetails details={product.details} />;
      default:
        return (
          <div>
            <p>Product type: {formatProductType(product.type)}</p>
            <pre>{JSON.stringify(product.details, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className='product-details' key='product-details-container'>
      {products.map((product) => (
        <ProductCard key={product.details?._id || `product-${product.type}`}>
          <ProductHeader>
            <ProductTitle>{formatProductType(product.type)}</ProductTitle>
            <StatusBadge $status={product.details?.status}>
              {product.details?.status || 'N/A'}
            </StatusBadge>
          </ProductHeader>
          <ProductActions
            product={product}
            onPaymentUpdate={handlePaymentUpdate}
          />
          {renderProductDetails(product)}
        </ProductCard>
      ))}
    </div>
  );
};

const MembersTable = ({ data, isLoading }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const columns = useMemo(
    () => [
      {
        Header: 'Member Name',
        accessor: 'memberName',
      },
      {
        Header: 'Contact',
        accessor: 'contactNo',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Products',
        id: 'products',
        Cell: ({ row }) => {
          const isExpanded = expandedRows[row.id];
          return (
            <Button
              variant='link'
              className='expand-button'
              onClick={() => {
                setExpandedRows((prev) => ({
                  ...prev,
                  [row.id]: !prev[row.id],
                }));
              }}
            >
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </Button>
          );
        },
      },
    ],
    [expandedRows]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: data || [],
    },
    useGlobalFilter,
    useSortBy
  );

  const { globalFilter } = state;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SearchContainer>
        <InputGroup>
          <Form.Control
            placeholder='Search members...'
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </InputGroup>
      </SearchContainer>

      <TableContainer>
        <Table {...getTableProps()} striped bordered hover responsive>
          <thead>
            {headerGroups.map((headerGroup) => {
              const { key, ...headerGroupProps } =
                headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...headerGroupProps}>
                  {headerGroup.headers.map((column) => {
                    const { key: headerKey, ...headerProps } =
                      column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th key={headerKey} {...headerProps}>
                        {column.render('Header')}
                        <span className='sort-icon'>
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <FaSortDown />
                            ) : (
                              <FaSortUp />
                            )
                          ) : (
                            <FaSort />
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              return (
                <React.Fragment key={rowKey}>
                  <tr {...rowProps}>
                    {row.cells.map((cell) => {
                      const { key: cellKey, ...cellProps } =
                        cell.getCellProps();
                      return (
                        <td key={cellKey} {...cellProps}>
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                  {expandedRows[row.id] && (
                    <tr>
                      <td colSpan={columns.length}>
                        <ProductDetails memberId={row.original._id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MembersTable;
