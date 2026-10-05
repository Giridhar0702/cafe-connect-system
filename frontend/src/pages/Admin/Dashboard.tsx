import React from 'react';
import { useStore } from '../../store/StoreContext';
import { ShoppingBag, DollarSign, Clock, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { orders } = useStore();

  const todayOrders = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = new Date(o.date).toISOString().split('T')[0];
    return today === orderDate;
  });

  const todayRevenue = todayOrders.reduce((acc, order) => acc + order.total, 0);
  const pendingOrders = orders.filter(o => ['Placed', 'Confirmed', 'Preparing'].includes(o.status)).length;

  const stats = [
    { title: "Today's Orders", value: todayOrders.length, icon: <ShoppingBag className="w-8 h-8 text-blue-500" />, bg: "bg-blue-50" },
    { title: "Today's Revenue", value: `₹${todayRevenue}`, icon: <DollarSign className="w-8 h-8 text-green-500" />, bg: "bg-green-50" },
    { title: "Pending Orders", value: pendingOrders, icon: <Clock className="w-8 h-8 text-yellow-500" />, bg: "bg-yellow-50" },
    { title: "Total Customers", value: "125", icon: <Users className="w-8 h-8 text-purple-500" />, bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
