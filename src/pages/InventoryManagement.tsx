import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Package, AlertTriangle } from 'lucide-react';

interface Supply {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

interface SupplyFormData {
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

function InventoryManagement() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplyFormData>();

  const { data: supplies, isLoading } = useQuery<Supply[]>({
    queryKey: ['supplies'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/inventory');
      return response.data;
    },
  });

  const addSupply = useMutation({
    mutationFn: async (data: SupplyFormData) => {
      const response = await axios.post('http://localhost:8000/api/inventory', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      reset();
    },
  });

  const onSubmit = (data: SupplyFormData) => {
    addSupply.mutate(data);
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
        <Package className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Supply</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Supply Name
                <input
                  type="text"
                  {...register('name', { required: 'Supply name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Car Shampoo"
                />
              </label>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Stock
                <input
                  type="number"
                  {...register('current_stock', {
                    required: 'Current stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
              {errors.current_stock && (
                <p className="mt-1 text-sm text-red-600">{errors.current_stock.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Stock
                <input
                  type="number"
                  {...register('minimum_stock', {
                    required: 'Minimum stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
              {errors.minimum_stock && (
                <p className="mt-1 text-sm text-red-600">{errors.minimum_stock.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit
                <input
                  type="text"
                  {...register('unit', { required: 'Unit is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="liters"
                />
              </label>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={addSupply.isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {addSupply.isLoading ? 'Adding...' : 'Add Supply'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplies?.map((supply) => (
                  <tr key={supply.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supply.name}</div>
                      <div className="text-sm text-gray-500">Unit: {supply.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {supply.current_stock} {supply.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        Min: {supply.minimum_stock} {supply.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {supply.current_stock <= supply.minimum_stock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
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

export default InventoryManagement;