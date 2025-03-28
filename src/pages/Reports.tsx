import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart2, Clock, DollarSign, Search } from 'lucide-react';

interface DailyIncome {
  date: string;
  total_income: number;
  services_count: number;
}

interface ServiceTime {
  service_type: string;
  average_time: number;
}

interface VehicleHistory {
  service_date: string;
  service_type: string;
  total_cost: number;
  employee_name: string;
}

function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchPlate, setSearchPlate] = useState('');

  const { data: dailyIncome, isLoading: isLoadingIncome } = useQuery<DailyIncome>({
    queryKey: ['dailyIncome', selectedDate],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:8000/api/reports/daily-income?date=${selectedDate}`
      );
      return response.data;
    },
  });

  const { data: serviceTimes, isLoading: isLoadingTimes } = useQuery<ServiceTime[]>({
    queryKey: ['serviceTimes'],
    queryFn: async () => {
      const response = await axios.get(
        'http://localhost:8000/api/reports/average-service-time'
      );
      return response.data;
    },
  });

  const { data: vehicleHistory, isLoading: isLoadingHistory } = useQuery<VehicleHistory[]>({
    queryKey: ['vehicleHistory', searchPlate],
    queryFn: async () => {
      if (!searchPlate) return null;
      const response = await axios.get(
        `http://localhost:8000/api/reports/vehicle-history/${searchPlate}`
      );
      return response.data;
    },
    enabled: !!searchPlate,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BarChart2 className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Income Report */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold">Daily Income Report</h2>
          </div>
          <div className="space-y-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {isLoadingIncome ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-green-700">Total Income:</span>
                  <span className="text-2xl font-bold text-green-700">
                    ${dailyIncome?.total_income || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-700">Services Completed:</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {dailyIncome?.services_count || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Average Service Time */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Average Service Time</h2>
          </div>
          {isLoadingTimes ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceTimes?.map((service) => (
                <div
                  key={service.service_type}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-700">{service.service_type}</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(service.average_time)} minutes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle History */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Vehicle Service History</h2>
          </div>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                placeholder="Enter plate number"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {isLoadingHistory ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ) : vehicleHistory ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicleHistory.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.service_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.service_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.employee_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${record.total_cost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              searchPlate && (
                <div className="text-center text-gray-500 py-4">
                  Enter a plate number to view service history
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;