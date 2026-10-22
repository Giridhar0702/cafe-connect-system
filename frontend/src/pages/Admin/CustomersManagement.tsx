import React, { useMemo } from 'react';
import { useStore } from '../../store/StoreContext';
import { Users, Phone, MapPin, ShoppingBag } from 'lucide-react';

const CustomersManagement: React.FC = () => {
  const { orders, adminSearchQuery } = useStore();

  const customers = useMemo(() => {
    const customerMap = new Map<string, { name: string; phone: string; address: string; totalSpent: number; orderCount: number; lastOrderDate: string }>();

    orders.forEach(order => {
      const existing = customerMap.get(order.phone);
      if (existing) {
        existing.totalSpent += order.total;
        existing.orderCount += 1;
        if (new Date(order.date) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.date;
        }
      } else {
        customerMap.set(order.phone, {
          name: order.customerName,
          phone: order.phone,
          address: order.address,
          totalSpent: order.total,
          orderCount: 1,
          lastOrderDate: order.date
        });
      }
    });

    return Array.from(customerMap.values())
      .filter(customer => {
        if (!adminSearchQuery) return true;
        const q = adminSearchQuery.toLowerCase();
        return customer.name.toLowerCase().includes(q) || customer.phone.toLowerCase().includes(q);
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, adminSearchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="w-6 h-6 mr-2 text-primary-600" />
          Customers
        </h1>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-gray-600">Customer Details</th>
                <th className="p-4 font-medium text-gray-600">Contact</th>
                <th className="p-4 font-medium text-gray-600">Address</th>
                <th className="p-4 font-medium text-gray-600">Total Orders</th>
                <th className="p-4 font-medium text-gray-600">Total Spent</th>
                <th className="p-4 font-medium text-gray-600">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No customers found yet.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.phone} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-1.5" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start max-w-[200px] text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1.5 mt-0.5 shrink-0" />
                        <span className="truncate" title={customer.address}>{customer.address}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center font-medium text-gray-700">
                        <ShoppingBag className="w-4 h-4 mr-1.5 text-gray-400" />
                        {customer.orderCount}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-primary-600">
                        ₹{customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersManagement;
