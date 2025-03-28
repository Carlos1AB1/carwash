import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Car } from 'lucide-react';

interface VehicleFormData {
  plate_number: string;
  vehicle_type: string;
  client_name: string;
  client_phone: string;
}

function VehicleRegistration() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>();

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const response = await axios.post('http://localhost:8000/api/vehicles', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      reset();
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Car className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Vehicle Registration</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              License Plate
              <input
                type="text"
                {...register('plate_number', { required: 'License plate is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="ABC123"
              />
            </label>
            {errors.plate_number && (
              <p className="mt-1 text-sm text-red-600">{errors.plate_number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Type
              <select
                {...register('vehicle_type', { required: 'Vehicle type is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="car">Car</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </label>
            {errors.vehicle_type && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicle_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Name
              <input
                type="text"
                {...register('client_name', { required: 'Client name is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </label>
            {errors.client_name && (
              <p className="mt-1 text-sm text-red-600">{errors.client_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
              <input
                type="tel"
                {...register('client_phone', { required: 'Phone number is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </label>
            {errors.client_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.client_phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VehicleRegistration;