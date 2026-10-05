import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../../store/StoreContext';

const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <Link to="/" className="text-primary-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-600 mb-8 font-medium">Order #{order.id}</p>
        
        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Estimated delivery:</p>
          <p className="text-2xl font-bold text-gray-900 mb-4">30–40 minutes</p>
          <div className="h-px bg-gray-200 w-full my-4"></div>
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-bold text-primary-600">₹{order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-500">Payment Method:</span>
            <span className="font-medium text-gray-700">{order.paymentMethod}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={`/orders/${order.id}`}
            className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30"
          >
            Track Order
          </Link>
          <Link 
            to="/menu"
            className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
