import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Droplets, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Service {
  id: number;
  vehicle: {
    plate_number: string;
    client_name: string;
  };
  service_type: string;
  status: 'pending' | 'in_progress' | 'completed';
  employee: {
    name: string;
  };
  start_time: string;
}

function ServiceManagement() {
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/services');
      return response.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await axios.patch(`http://localhost:8000/api/services/${id}/status`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
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
        <Droplets className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Service Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services?.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {service.vehicle.plate_number}
                  </div>
                  <div className="text-sm text-gray-500">{service.vehicle.client_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.service_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.employee.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      service.status
                    )}`}
                  >
                    {service.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(service.start_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {service.status === 'pending' && (
                      <button
                        onClick={() =>
                          updateStatus.mutate({ id: service.id, status: 'in_progress' })
                        }
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Clock className="h-5 w-5" />
                      </button>
                    )}
                    {service.status === 'in_progress' && (
                      <button
                        onClick={() =>
                          updateStatus.mutate({ id: service.id, status: 'completed' })
                        }
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {service.status !== 'completed' && (
                      <button
                        onClick={() =>
                          updateStatus.mutate({ id: service.id, status: 'cancelled' })
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ServiceManagement;