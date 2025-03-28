import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Users, UserPlus } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
  shift: string;
  active: boolean;
  current_workload: number;
}

interface EmployeeFormData {
  name: string;
  position: string;
  shift: string;
}

function EmployeeManagement() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>();

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/employees');
      return response.data;
    },
  });

  const addEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await axios.post('http://localhost:8000/api/employees', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      reset();
    },
  });

  const toggleEmployeeStatus = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await axios.patch(`http://localhost:8000/api/employees/${id}/status`, {
        active,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    addEmployee.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Users className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Employee Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Add New Employee</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </label>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Position
                <select
                  {...register('position', { required: 'Position is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select position</option>
                  <option value="washer">Washer</option>
                  <option value="detailer">Detailer</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                </select>
              </label>
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shift
                <select
                  {...register('shift', { required: 'Shift is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select shift</option>
                  <option value="morning">Morning (6AM - 2PM)</option>
                  <option value="afternoon">Afternoon (2PM - 10PM)</option>
                  <option value="night">Night (10PM - 6AM)</option>
                </select>
              </label>
              {errors.shift && (
                <p className="mt-1 text-sm text-red-600">{errors.shift.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={addEmployee.isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {addEmployee.isLoading ? 'Adding...' : 'Add Employee'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Employee List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees?.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.shift}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(employee.current_workload / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {employee.current_workload} tasks
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          toggleEmployeeStatus.mutate({
                            id: employee.id,
                            active: !employee.active,
                          })
                        }
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagement;