import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { ChevronDown, ChevronUp, Receipt, Bluetooth } from 'lucide-react';
import type { Order } from '../../types';
import { bluetoothPrinter, formatLine, formatCenter } from '../../utils/printer';

const OrdersManagement: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);

  const statuses = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const connectPrinter = async () => {
    try {
      await bluetoothPrinter.connect();
      setIsPrinterConnected(true);
      alert('Printer connected successfully!');
    } catch (err: any) {
      alert('Failed to connect: ' + err.message);
    }
  };

  const handlePrint = async (order: Order) => {
    if (!bluetoothPrinter.isConnected()) {
      alert('Please connect the Bluetooth printer first using the button at the top.');
      return;
    }

    const date = new Date(order.date).toLocaleString();

    const kotLines: string[] = [];
    kotLines.push(formatCenter(`Order: #${order.id.slice(0, 8)}`));
    kotLines.push(formatCenter(`Date: ${date}`));
    kotLines.push(formatCenter(`Type: ${order.address}`));
    kotLines.push('-'.repeat(32));
    for (const item of order.items) {
      kotLines.push(`${item.quantity}x ${item.name}`);
    }

    const billLines: string[] = [];
    billLines.push(formatCenter(`Order: #${order.id.slice(0, 8)}`));
    billLines.push(formatCenter(`Customer: ${order.customerName}`));
    billLines.push(formatCenter(`Phone: ${order.phone}`));
    billLines.push(formatCenter(`Date: ${date}`));
    billLines.push('-'.repeat(32));
    
    for (const item of order.items) {
      const left = `${item.quantity}x ${item.name}`.substring(0, 22);
      const right = `Rs.${(item.price * item.quantity).toFixed(2)}`;
      billLines.push(formatLine(left, right));
    }
    
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    let exactTotal = subtotal + cgst + sgst;
    let deliveryFee = 0;
    
    // Deduce if delivery was included by checking against the final order total
    if (order.total > Math.ceil(exactTotal) + 10) {
      deliveryFee = 30;
      exactTotal += 30;
    }

    billLines.push('-'.repeat(32));
    billLines.push(formatLine('Subtotal', `Rs.${subtotal.toFixed(2)}`));
    if (deliveryFee > 0) {
      billLines.push(formatLine('Delivery', `Rs.${deliveryFee.toFixed(2)}`));
    }
    billLines.push(formatLine('CGST (2.5%)', `Rs.${cgst.toFixed(2)}`));
    billLines.push(formatLine('SGST (2.5%)', `Rs.${sgst.toFixed(2)}`));
    
    const roundedTotal = Math.ceil(exactTotal);
    if (roundedTotal !== exactTotal) {
      const rounding = roundedTotal - exactTotal;
      billLines.push(formatLine('Rounding', `+Rs.${rounding.toFixed(2)}`));
    }
    
    billLines.push('-'.repeat(32));
    billLines.push(formatLine('Total', `Rs.${roundedTotal.toFixed(2)}`));
    billLines.push('');
    billLines.push(formatCenter('Thank you!'));

    try {
      await bluetoothPrinter.print(kotLines, true);
      await new Promise(r => setTimeout(r, 1000)); // Delay between prints
      await bluetoothPrinter.print(billLines, false);
    } catch (err: any) {
      alert('Print failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <button
          onClick={connectPrinter}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPrinterConnected 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Bluetooth size={18} />
          <span>{isPrinterConnected ? 'Printer Connected' : 'Connect Bluetooth Printer'}</span>
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-gray-600 w-10"></th>
                <th className="p-4 font-medium text-gray-600">Order ID</th>
                <th className="p-4 font-medium text-gray-600">Customer</th>
                <th className="p-4 font-medium text-gray-600">Date & Time</th>
                <th className="p-4 font-medium text-gray-600">Total</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <React.Fragment key={order.id}>
                  <tr 
                    onClick={() => toggleExpand(order.id)}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${expandedOrderId === order.id ? 'bg-gray-50' : ''}`}
                  >
                    <td className="p-4">
                      <button 
                        onClick={() => toggleExpand(order.id)}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                      >
                        {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </td>
                    <td className="p-4 font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.phone}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(order.date).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium text-gray-900">₹{order.total}</td>
                    <td className="p-4">
                      <select 
                        value={order.status} 
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePrint(order); }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                          title="Print Bill & KOT"
                        >
                          <Receipt size={16} />
                          <span>Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={7} className="p-0">
                        <div className="p-6 pt-2 pb-6 pl-14">
                          <h4 className="font-semibold text-gray-800 mb-4">Order Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Items</h5>
                              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <ul className="divide-y divide-gray-100">
                                  {order.items.map((item, idx) => (
                                    <li key={idx} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                      <div className="flex items-center space-x-3">
                                        <span className="font-medium text-gray-800">{item.quantity}x</span>
                                        <span className="text-gray-700">{item.name}</span>
                                      </div>
                                      <span className="text-gray-600 font-medium">₹{item.price * item.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                                {(() => {
                                  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                                  const cgst = subtotal * 0.025;
                                  const sgst = subtotal * 0.025;
                                  let exactTotal = subtotal + cgst + sgst;
                                  let deliveryFee = 0;
                                  if (order.total > Math.ceil(exactTotal) + 10) {
                                    deliveryFee = 30;
                                    exactTotal += 30;
                                  }
                                  const roundedTotal = Math.ceil(exactTotal);
                                  return (
                                    <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm space-y-1">
                                      <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                      </div>
                                      {deliveryFee > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                          <span>Delivery</span>
                                          <span>₹{deliveryFee.toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-gray-600">
                                        <span>CGST (2.5%)</span>
                                        <span>₹{cgst.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-gray-600">
                                        <span>SGST (2.5%)</span>
                                        <span>₹{sgst.toFixed(2)}</span>
                                      </div>
                                      {roundedTotal !== exactTotal && (
                                        <div className="flex justify-between text-gray-400 text-xs">
                                          <span>Rounding</span>
                                          <span>+₹{(roundedTotal - exactTotal).toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between items-center font-bold text-base pt-2 mt-1 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-orange-600">₹{roundedTotal.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Delivery Info</h5>
                              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                                <div>
                                  <span className="block text-xs text-gray-500">Address</span>
                                  <span className="block text-gray-800 font-medium">{order.address}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500">Payment Method</span>
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium mt-1">
                                    {order.paymentMethod}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
