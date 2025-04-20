import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import { format } from 'date-fns';
import {
  useMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
} from '../hooks/useMemberApi';
import Modal from '../components/Modal';
import MemberActions from '../components/MemberActions';
import PasswordInput from '../components/PasswordInput';

const MembersTable = React.memo(({ members, onEdit, onDelete }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Welin ID',
        accessor: 'welinId',
      },
      {
        Header: 'Member Name',
        accessor: 'memberName',
      },
      {
        Header: 'Contact',
        accessor: 'contactNo',
        Cell: ({ value }) => value || '-',
      },
      {
        Header: 'Age',
        accessor: 'age',
      },
      {
        Header: 'Gender',
        accessor: 'gender',
      },
      {
        Header: 'Date of Birth',
        accessor: 'dob',
        Cell: ({ value }) => format(new Date(value), 'MM/dd/yyyy'),
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => format(new Date(value), 'MM/dd/yyyy HH:mm'),
      },
      {
        Header: 'Actions',
        accessor: '_id',
        Cell: ({ row }) => (
          <MemberActions
            member={row.original}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const {
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize },
    setPageSize,
    pageCount,
    gotoPage,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: members,
      initialState: { pageSize: 10 },
      autoResetPage: false,
      autoResetSortBy: false,
      autoResetFilters: false,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h2 className='text-xl font-semibold mb-4'>Members</h2>
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Search members...'
          onChange={(e) => setGlobalFilter(e.target.value)}
          className='w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
        />
      </div>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          {headerGroups.map((headerGroup) => {
            const { key, ...headerGroupProps } =
              headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...headerGroupProps}>
                {headerGroup.headers.map((column) => {
                  const { key, ...headerProps } = column.getHeaderProps(
                    column.getSortByToggleProps()
                  );
                  return (
                    <th
                      key={key}
                      {...headerProps}
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {page.map((row) => {
            prepareRow(row);
            const { key, ...rowProps } = row.getRowProps();
            return (
              <tr key={key} {...rowProps}>
                {row.cells.map((cell) => {
                  const { key, ...cellProps } = cell.getCellProps();
                  return (
                    <td
                      key={key}
                      {...cellProps}
                      className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className='flex justify-between items-center mt-4'>
        <div>
          <span className='mr-2'>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className='rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className='ml-2'>entries</span>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => gotoPage(0)}
            disabled={pageIndex === 0}
            className='px-3 py-1 rounded-md border border-gray-300'
          >
            {'<<'}
          </button>
          <button
            onClick={() => gotoPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            className='px-3 py-1 rounded-md border border-gray-300'
          >
            {'<'}
          </button>
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageCount}
            </strong>
          </span>
          <button
            onClick={() => gotoPage(pageIndex + 1)}
            disabled={pageIndex === pageCount - 1}
            className='px-3 py-1 rounded-md border border-gray-300'
          >
            {'>'}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={pageIndex === pageCount - 1}
            className='px-3 py-1 rounded-md border border-gray-300'
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
});

const VendorDashboard = () => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' or 'edit'
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({
    memberName: '',
    contactNo: '',
    email: '',
    dob: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    occupation: '',
    nominee: {
      name: '',
      relation: '',
      contactNo: '',
    },
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Get vendor data from localStorage
  const vendorData = useMemo(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Fetch members data using the custom hook
  const { data: members = [], isLoading } = useMembers(vendorData?._id);

  // Create member mutation using the custom hook
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  // Calculate member statistics
  const memberStats = useMemo(() => {
    if (!members.length)
      return {
        totalMembers: 0,
        maleCount: 0,
        femaleCount: 0,
        otherCount: 0,
        averageAge: 0,
        ageGroups: {
          '18-25': 0,
          '26-35': 0,
          '36-45': 0,
          '46+': 0,
        },
      };

    const stats = {
      totalMembers: members.length,
      maleCount: members.filter((m) => m.gender === 'male').length,
      femaleCount: members.filter((m) => m.gender === 'female').length,
      otherCount: members.filter((m) => m.gender === 'other').length,
      averageAge: Math.round(
        members.reduce((sum, m) => sum + m.age, 0) / members.length
      ),
      ageGroups: {
        '18-25': members.filter((m) => m.age >= 18 && m.age <= 25).length,
        '26-35': members.filter((m) => m.age >= 26 && m.age <= 35).length,
        '36-45': members.filter((m) => m.age >= 36 && m.age <= 45).length,
        '46+': members.filter((m) => m.age > 45).length,
      },
    };

    return stats;
  }, [members]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields validation only
    if (!newMember.memberName.trim()) {
      newErrors.memberName = 'Member Name is required';
    }
    if (!newMember.dob) {
      newErrors.dob = 'Date of Birth is required';
    }
    if (!newMember.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Additional validations for required fields
    if (newMember.dob) {
      const dob = new Date(newMember.dob);
      const today = new Date();
      if (dob >= today) {
        newErrors.dob = 'Date of Birth must be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newMember]);

  const calculateAge = useCallback((dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }, []);

  const handleEdit = (member) => {
    setMode('edit');
    setSelectedMember(member);
    setNewMember({
      memberName: member.memberName,
      contactNo: member.contactNo || '',
      email: member.email || '',
      dob: member.dob.split('T')[0], // Convert ISO date to YYYY-MM-DD format
      gender: member.gender,
      address: member.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      occupation: member.occupation || '',
      nominee: member.nominee || {
        name: '',
        relation: '',
        contactNo: '',
      },
      password: '',
    });
    setShowAddMember(true);
  };

  const handleDelete = useCallback(
    async (memberId) => {
      try {
        await deleteMember.mutateAsync(memberId);
        toast.success('Member deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete member');
      }
    },
    [deleteMember]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!validateForm()) {
        console.log('Form validation failed:', errors);
        return;
      }

      if (!vendorData?._id) {
        console.error('Vendor ID not found in user data');
        return;
      }

      const age = calculateAge(newMember.dob);
      const formData = {
        memberName: newMember.memberName.trim(),
        dob: new Date(newMember.dob).toISOString(),
        gender: newMember.gender,
        age,
        vendorId: vendorData._id,
        isActive: true,
        loanFlag: false,
        // Optional fields - only include if they have values
        ...(newMember.contactNo && { contactNo: newMember.contactNo }),
        ...(newMember.email && { email: newMember.email }),
        ...(newMember.occupation && { occupation: newMember.occupation }),
        ...(Object.values(newMember.address).some((value) => value.trim()) && {
          address: newMember.address,
        }),
        ...(Object.values(newMember.nominee).some((value) => value.trim()) && {
          nominee: newMember.nominee,
        }),
        ...(newMember.password && { password: newMember.password }),
      };

      if (mode === 'create') {
        createMember.mutate(formData, {
          onSuccess: () => {
            setShowAddMember(false);
            setNewMember({
              memberName: '',
              contactNo: '',
              email: '',
              dob: '',
              gender: '',
              address: {
                street: '',
                city: '',
                state: '',
                pincode: '',
              },
              occupation: '',
              nominee: {
                name: '',
                relation: '',
                contactNo: '',
              },
              password: '',
            });
            setErrors({});
            toast.success('Member created successfully');
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || 'Failed to create member'
            );
          },
        });
      } else {
        updateMember.mutate(
          {
            memberId: selectedMember._id,
            memberData: formData,
          },
          {
            onSuccess: () => {
              setShowAddMember(false);
              setMode('create');
              setSelectedMember(null);
              setNewMember({
                memberName: '',
                contactNo: '',
                email: '',
                dob: '',
                gender: '',
                address: {
                  street: '',
                  city: '',
                  state: '',
                  pincode: '',
                },
                occupation: '',
                nominee: {
                  name: '',
                  relation: '',
                  contactNo: '',
                },
                password: '',
              });
              setErrors({});
              toast.success('Member updated successfully');
            },
            onError: (error) => {
              toast.error(
                error.response?.data?.message || 'Failed to update member'
              );
            },
          }
        );
      }
    },
    [
      newMember,
      createMember,
      updateMember,
      vendorData,
      validateForm,
      calculateAge,
      errors,
      mode,
      selectedMember,
    ]
  );

  const handleCloseModal = useCallback(() => {
    setShowAddMember(false);
    setMode('create');
    setSelectedMember(null);
    setNewMember({
      memberName: '',
      contactNo: '',
      email: '',
      dob: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      occupation: '',
      nominee: {
        name: '',
        relation: '',
        contactNo: '',
      },
      password: '',
    });
    setErrors({});
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title='Vendor Dashboard'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='Vendor Dashboard'>
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Quick Stats</h2>
        <div className='grid grid-cols-4 gap-4'>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <p className='text-sm text-blue-600'>Total Members</p>
            <p className='text-2xl font-bold text-blue-700'>
              {memberStats.totalMembers}
            </p>
          </div>
          <div className='p-4 bg-green-50 rounded-lg'>
            <p className='text-sm text-green-600'>Average Age</p>
            <p className='text-2xl font-bold text-green-700'>
              {memberStats.averageAge}
            </p>
          </div>
          <div className='p-4 bg-purple-50 rounded-lg'>
            <p className='text-sm text-purple-600'>Gender Distribution</p>
            <div className='flex justify-between mt-1'>
              <span className='text-sm text-purple-700'>
                M: {memberStats.maleCount}
              </span>
              <span className='text-sm text-purple-700'>
                F: {memberStats.femaleCount}
              </span>
              <span className='text-sm text-purple-700'>
                O: {memberStats.otherCount}
              </span>
            </div>
          </div>
          <div className='p-4 bg-yellow-50 rounded-lg'>
            <p className='text-sm text-yellow-600'>Age Groups</p>
            <div className='grid grid-cols-2 gap-1 mt-1'>
              <span className='text-sm text-yellow-700'>
                18-25: {memberStats.ageGroups['18-25']}
              </span>
              <span className='text-sm text-yellow-700'>
                26-35: {memberStats.ageGroups['26-35']}
              </span>
              <span className='text-sm text-yellow-700'>
                36-45: {memberStats.ageGroups['36-45']}
              </span>
              <span className='text-sm text-yellow-700'>
                46+: {memberStats.ageGroups['46+']}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <button
          onClick={() => {
            setMode('create');
            setSelectedMember(null);
            setNewMember({
              memberName: '',
              contactNo: '',
              email: '',
              dob: '',
              gender: '',
              address: {
                street: '',
                city: '',
                state: '',
                pincode: '',
              },
              occupation: '',
              nominee: {
                name: '',
                relation: '',
                contactNo: '',
              },
              password: '',
            });
            setShowAddMember(!showAddMember);
          }}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
        >
          {showAddMember ? 'Cancel' : 'Add New Member'}
        </button>
      </div>

      <Modal
        isOpen={showAddMember}
        onClose={handleCloseModal}
        title={mode === 'create' ? 'Add New Member' : 'Update Member'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Member Name *
              </label>
              <input
                type='text'
                value={newMember.memberName}
                onChange={(e) => {
                  setNewMember({ ...newMember, memberName: e.target.value });
                  if (errors.memberName) {
                    setErrors({ ...errors, memberName: '' });
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.memberName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Member Name'
                required
              />
              {errors.memberName && (
                <p className='mt-1 text-sm text-red-600'>{errors.memberName}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Contact Number
              </label>
              <input
                type='tel'
                value={newMember.contactNo}
                onChange={(e) => {
                  setNewMember({ ...newMember, contactNo: e.target.value });
                  if (errors.contactNo) {
                    setErrors({ ...errors, contactNo: '' });
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.contactNo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter 10-digit mobile number'
              />
              {errors.contactNo && (
                <p className='mt-1 text-sm text-red-600'>{errors.contactNo}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Email
              </label>
              <input
                type='email'
                value={newMember.email}
                onChange={(e) => {
                  setNewMember({ ...newMember, email: e.target.value });
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Email'
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Date of Birth *
              </label>
              <input
                type='date'
                value={newMember.dob}
                onChange={(e) => {
                  setNewMember({ ...newMember, dob: e.target.value });
                  if (errors.dob) {
                    setErrors({ ...errors, dob: '' });
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.dob ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.dob && (
                <p className='mt-1 text-sm text-red-600'>{errors.dob}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Gender *
              </label>
              <select
                value={newMember.gender}
                onChange={(e) => {
                  setNewMember({ ...newMember, gender: e.target.value });
                  if (errors.gender) {
                    setErrors({ ...errors, gender: '' });
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value=''>Select Gender</option>
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='other'>Other</option>
              </select>
              {errors.gender && (
                <p className='mt-1 text-sm text-red-600'>{errors.gender}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Occupation
              </label>
              <input
                type='text'
                value={newMember.occupation}
                onChange={(e) => {
                  setNewMember({ ...newMember, occupation: e.target.value });
                  if (errors.occupation) {
                    setErrors({ ...errors, occupation: '' });
                  }
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.occupation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter Occupation'
              />
              {errors.occupation && (
                <p className='mt-1 text-sm text-red-600'>{errors.occupation}</p>
              )}
            </div>
          </div>

          <div className='mt-4'>
            <h3 className='text-lg font-medium text-gray-700 mb-2'>Address</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Street
                </label>
                <input
                  type='text'
                  value={newMember.address.street}
                  onChange={(e) => {
                    setNewMember({
                      ...newMember,
                      address: {
                        ...newMember.address,
                        street: e.target.value,
                      },
                    });
                    if (errors['address.street']) {
                      setErrors({ ...errors, 'address.street': '' });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['address.street']
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter Street Address'
                />
                {errors['address.street'] && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors['address.street']}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  City
                </label>
                <input
                  type='text'
                  value={newMember.address.city}
                  onChange={(e) => {
                    setNewMember({
                      ...newMember,
                      address: { ...newMember.address, city: e.target.value },
                    });
                    if (errors['address.city']) {
                      setErrors({ ...errors, 'address.city': '' });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['address.city']
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter City'
                />
                {errors['address.city'] && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors['address.city']}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  State
                </label>
                <input
                  type='text'
                  value={newMember.address.state}
                  onChange={(e) => {
                    setNewMember({
                      ...newMember,
                      address: {
                        ...newMember.address,
                        state: e.target.value,
                      },
                    });
                    if (errors['address.state']) {
                      setErrors({ ...errors, 'address.state': '' });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['address.state']
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter State'
                />
                {errors['address.state'] && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors['address.state']}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Pincode
                </label>
                <input
                  type='text'
                  value={newMember.address.pincode}
                  onChange={(e) => {
                    setNewMember({
                      ...newMember,
                      address: {
                        ...newMember.address,
                        pincode: e.target.value,
                      },
                    });
                    if (errors['address.pincode']) {
                      setErrors({ ...errors, 'address.pincode': '' });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['address.pincode']
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter Pincode'
                />
                {errors['address.pincode'] && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors['address.pincode']}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <h3 className='text-lg font-medium text-gray-700 mb-2'>
              Nominee Details
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Nominee Name
                </label>
                <input
                  type='text'
                  value={newMember.nominee.name}
                  onChange={(e) => {
                    setNewMember({
                      ...newMember,
                      nominee: { ...newMember.nominee, name: e.target.value },
                    });
                    if (errors['nominee.name']) {
                      setErrors({ ...errors, 'nominee.name': '' });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['nominee.name']
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter Nominee Name'
                />
                {errors['nominee.name'] && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors['nominee.name']}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Relation
                </label>
                <input
                  type='text'
                  value={newMember.nominee.relation}
                  onChange={(e) => {
                    setNewMember({
                      ...newMember,
                      nominee: {
                        ...newMember.nominee,
                        relation: e.target.value,
                      },
                    });
                    if (errors['nominee.relation']) {
                      setErrors({ ...errors, 'nominee.relation': '' });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['nominee.relation']
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter Relation'
                />
                {errors['nominee.relation'] && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors['nominee.relation']}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Nominee Contact Number
                </label>
                <input
                  type='tel'
                  value={newMember.nominee.contactNo}
                  onChange={(e) => {
                    setNewMember({
                      ...newMember,
                      nominee: {
                        ...newMember.nominee,
                        contactNo: e.target.value,
                      },
                    });
                    if (errors['nominee.contactNo']) {
                      setErrors({ ...errors, 'nominee.contactNo': '' });
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['nominee.contactNo']
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter 10-digit mobile number'
                />
                {errors['nominee.contactNo'] && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors['nominee.contactNo']}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <PasswordInput
              name='password'
              value={newMember.password}
              onChange={(e) => {
                setNewMember({ ...newMember, password: e.target.value });
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              placeholder='Enter password'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            />
            {errors.password && (
              <p className='mt-1 text-sm text-red-600'>{errors.password}</p>
            )}
          </div>

          <div className='flex justify-end mt-6'>
            <button
              type='submit'
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              disabled={createMember.isLoading}
            >
              {mode === 'create' ? 'Add Member' : 'Update Member'}
            </button>
          </div>
        </form>
      </Modal>

      <MembersTable
        members={members}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default VendorDashboard;
