import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/StoreContext';
import { 
  ChevronDown, 
  ChevronUp, 
  Receipt, 
  Bluetooth, 
  Eye, 
  X, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Settings2
} from 'lucide-react';
import type { Order } from '../../types';
import { bluetoothPrinter, formatLine, formatCenter } from '../../utils/printer';
import { PrinterManagerModal } from '../../components/admin/PrinterManagerModal';
import { orderAlarm } from '../../utils/alarm';

const OrdersManagement: React.FC = () => {
  const { orders, updateOrderStatus, deliveryPartners, adminSearchQuery } = useStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Silence alarm as admin is now viewing the orders page
    orderAlarm.stopAlarm();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (!adminSearchQuery) return true;
    const q = adminSearchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.phone.toLowerCase().includes(q) ||
      order.items.some(item => item.name.toLowerCase().includes(q))
    );
  });

  const [isPrinterConnected, setIsPrinterConnected] = useState(bluetoothPrinter.isConnected());
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(bluetoothPrinter.getDeviceName());
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [viewingBillOrder, setViewingBillOrder] = useState<Order | null>(null);
  const [printChoiceOrder, setPrintChoiceOrder] = useState<Order | null>(null);
  const [printingBillOrder, setPrintingBillOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const statuses = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  useEffect(() => {
    bluetoothPrinter.onDisconnect(() => {
      setIsPrinterConnected(false);
      setConnectedDeviceName(null);
      showToast('Bluetooth printer disconnected', 'info');
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const triggerBrowserPrint = (order: Order) => {
    setPrintingBillOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintBluetooth = async (order: Order) => {
    if (!bluetoothPrinter.isConnected()) {
      setPrintChoiceOrder(order);
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
    billLines.push('-'.repeat(32));
    billLines.push(formatCenter('TERMS & CONDITIONS:'));
    billLines.push(formatCenter('No cancellation is available'));
    billLines.push(formatCenter('& no refund at any cost.'));
    billLines.push('-'.repeat(32));
    billLines.push('');
    billLines.push(formatCenter('Thank you!'));

    try {
      await bluetoothPrinter.print(kotLines, true);
      await new Promise(r => setTimeout(r, 1000)); // Delay between prints
      await bluetoothPrinter.print(billLines, false);
      showToast(`Printed receipt for #${order.id.slice(0, 8)}`, 'success');
    } catch (err: any) {
      showToast('Bluetooth print failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-600/95 text-white border-emerald-400' 
              : toast.type === 'error'
              ? 'bg-rose-600/95 text-white border-rose-400'
              : 'bg-gray-900/95 text-white border-gray-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-200 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Live order queue & thermal POS printer dispatch</p>
        </div>

        {/* Printer Setup Button */}
        <button
          onClick={() => setIsPrinterModalOpen(true)}
          className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            isPrinterConnected 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
          }`}
        >
          <div className="relative">
            <Bluetooth size={18} className={isPrinterConnected ? 'text-emerald-600' : 'text-white'} />
            {isPrinterConnected && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span>
            {isPrinterConnected 
              ? (connectedDeviceName ? `Printer: ${connectedDeviceName}` : 'Printer Online') 
              : 'Connect Bluetooth Printer'
            }
          </span>
          <Settings2 size={16} className={isPrinterConnected ? 'text-emerald-600 ml-1' : 'text-blue-200 ml-1'} />
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
              {filteredOrders.map(order => (
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
                          onClick={(e) => { e.stopPropagation(); setViewingBillOrder(order); }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                          title="View Digital Bill"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (isPrinterConnected) {
                              handlePrintBluetooth(order);
                            } else {
                              setPrintChoiceOrder(order);
                            }
                          }}
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
                              
                              <h5 className="text-sm font-medium text-gray-500 mb-2 mt-6 uppercase tracking-wider">Delivery Partner</h5>
                              <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <label className="block text-xs text-gray-500 mb-2">Assign Partner</label>
                                <select 
                                  value={order.deliveryManPhone || ''} 
                                  onChange={(e) => {
                                    const selectedPartner = deliveryPartners.find(p => p.phone === e.target.value);
                                    if (selectedPartner) {
                                      updateOrderStatus(order.id, order.status, selectedPartner.name, selectedPartner.phone);
                                    } else {
                                      updateOrderStatus(order.id, order.status, '', '');
                                    }
                                  }}
                                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition"
                                >
                                  <option value="">-- Unassigned --</option>
                                  {deliveryPartners.filter(p => p.active).map(p => (
                                    <option key={p.id} value={p.phone}>{p.name} ({p.phone})</option>
                                  ))}
                                  {order.deliveryManName && !deliveryPartners.find(p => p.phone === order.deliveryManPhone) && (
                                    <option value={order.deliveryManPhone || ''}>{order.deliveryManName} ({order.deliveryManPhone})</option>
                                  )}
                                </select>
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

      {/* View Bill Modal */}
      {viewingBillOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-gray-600" /> Digital Bill
              </h3>
              <button 
                onClick={() => setViewingBillOrder(null)}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl mb-1">Elai Virundhu & Cafe</h2>
                <p className="text-sm">Order: #{viewingBillOrder.id.slice(0, 8)}</p>
                <p className="text-sm">Customer: {viewingBillOrder.customerName}</p>
                <p className="text-sm">Phone: {viewingBillOrder.phone}</p>
                <p className="text-sm">Date: {new Date(viewingBillOrder.date).toLocaleString()}</p>
              </div>

              <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold pb-2">Item</th>
                      <th className="text-right font-semibold pb-2">Qty</th>
                      <th className="text-right font-semibold pb-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingBillOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1">{item.name}</td>
                        <td className="text-right py-1">{item.quantity}</td>
                        <td className="text-right py-1">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(() => {
                const subtotal = viewingBillOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const cgst = subtotal * 0.025;
                const sgst = subtotal * 0.025;
                let exactTotal = subtotal + cgst + sgst;
                let deliveryFee = 0;
                if (viewingBillOrder.total > Math.ceil(exactTotal) + 10) {
                  deliveryFee = 30;
                  exactTotal += 30;
                }
                const roundedTotal = Math.ceil(exactTotal);
                
                return (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>₹{deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>CGST (2.5%):</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (2.5%):</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                    {roundedTotal !== exactTotal && (
                      <div className="flex justify-between text-gray-500">
                        <span>Rounding:</span>
                        <span>+₹{(roundedTotal - exactTotal).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t border-dashed border-gray-400">
                      <span>TOTAL:</span>
                      <span>₹{roundedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
              
              <div className="text-center mt-6 pt-3 border-t border-dashed border-gray-300 text-[11px] text-gray-500">
                <p className="font-bold text-gray-700 uppercase tracking-wider mb-0.5">Terms &amp; Conditions</p>
                <p>No cancellation is available and no refund will be provided at any cost.</p>
              </div>

              <div className="text-center mt-3 text-sm">
                <p>Thank you for dining with us!</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
              <button 
                onClick={() => {
                  triggerBrowserPrint(viewingBillOrder);
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-sm transition flex items-center shadow-sm"
              >
                <Printer className="w-4 h-4 mr-2 text-gray-600" /> System Print (USB)
              </button>

              <button 
                onClick={() => {
                  if (isPrinterConnected) {
                    handlePrintBluetooth(viewingBillOrder);
                    setViewingBillOrder(null);
                  } else {
                    setPrintChoiceOrder(viewingBillOrder);
                  }
                }}
                className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-sm hover:bg-primary-700 transition flex items-center"
              >
                <Receipt className="w-4 h-4 mr-2" /> 
                {isPrinterConnected ? 'Print (Bluetooth)' : 'Print / Connect Printer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Print Method Selector Modal (if printer not connected) */}
      {printChoiceOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-base text-gray-800 flex items-center">
                <Printer className="w-5 h-5 mr-2 text-blue-600" /> Print Order #{printChoiceOrder.id.slice(0, 8)}
              </h3>
              <button 
                onClick={() => setPrintChoiceOrder(null)}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-500">
                Choose how you want to print the receipt and KOT for customer <strong>{printChoiceOrder.customerName}</strong>:
              </p>

              {/* Option 1: System / Browser Print */}
              <button
                onClick={() => {
                  const ord = printChoiceOrder;
                  setPrintChoiceOrder(null);
                  triggerBrowserPrint(ord);
                }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-start space-x-3 group"
              >
                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-800">Browser / System Print (Recommended)</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Prints instantly on USB, Network, or Windows-paired thermal receipt printers.
                  </div>
                </div>
              </button>

              {/* Option 2: Connect Bluetooth Printer */}
              <button
                onClick={() => {
                  setPrintChoiceOrder(null);
                  setIsPrinterModalOpen(true);
                }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-start space-x-3 group"
              >
                <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-800">Pair Bluetooth Thermal Printer</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Connect wireless ESC/POS thermal printer via Web Bluetooth.
                  </div>
                </div>
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setPrintChoiceOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printer Management Modal */}
      <PrinterManagerModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
        isPrinterConnected={isPrinterConnected}
        connectedDeviceName={connectedDeviceName}
        onConnectionChange={(connected, devName) => {
          setIsPrinterConnected(connected);
          setConnectedDeviceName(devName);
        }}
        onShowToast={showToast}
      />

      {/* Hidden Thermal Printable Slip for System Browser Printing */}
      {printingBillOrder && (
        <div id="printable-receipt" className="hidden print:block">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Elai Virundhu &amp; Cafe</h2>
            <div style={{ fontSize: '11px' }}>Order: #{printingBillOrder.id.slice(0, 8)}</div>
            <div style={{ fontSize: '11px' }}>Customer: {printingBillOrder.customerName}</div>
            <div style={{ fontSize: '11px' }}>Phone: {printingBillOrder.phone}</div>
            <div style={{ fontSize: '11px' }}>Date: {new Date(printingBillOrder.date).toLocaleString()}</div>
          </div>

          <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', margin: '6px 0' }}>
            <table style={{ width: '100%', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
                  <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Qty</th>
                  <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {printingBillOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left', padding: '2px 0' }}>{item.name}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '2px 0' }}>Rs.{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(() => {
            const subtotal = printingBillOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const cgst = subtotal * 0.025;
            const sgst = subtotal * 0.025;
            let exactTotal = subtotal + cgst + sgst;
            let deliveryFee = 0;
            if (printingBillOrder.total > Math.ceil(exactTotal) + 10) {
              deliveryFee = 30;
              exactTotal += 30;
            }
            const roundedTotal = Math.ceil(exactTotal);

            return (
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>Rs.{subtotal.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Fee:</span>
                    <span>Rs.{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CGST (2.5%):</span>
                  <span>Rs.{cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SGST (2.5%):</span>
                  <span>Rs.{sgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '1px dashed #000', paddingTop: '4px', marginTop: '4px' }}>
                  <span>TOTAL:</span>
                  <span>Rs.{roundedTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })()}

          <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '6px', borderTop: '1px dashed #000', fontSize: '10px' }}>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Terms &amp; Conditions:</div>
            <div>No cancellation is available and no refund will be provided at any cost.</div>
            <div style={{ marginTop: '6px', fontSize: '11px' }}>Thank you for dining with us!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
