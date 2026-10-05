import React from 'react';
import { useStore } from '../../store/StoreContext';

const OrdersManagement: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();

  const statuses = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Order ID</th>
              <th className="p-4 font-medium text-gray-600">Customer</th>
              <th className="p-4 font-medium text-gray-600">Total</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-50 last:border-0">
                <td className="p-4 font-medium">{order.id}</td>
                <td className="p-4">{order.customerName}</td>
                <td className="p-4">₹{order.total}</td>
                <td className="p-4">
                  <select 
                    value={order.status} 
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                    className="border border-gray-300 rounded p-1"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersManagement;
