import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';

const OffersManagement: React.FC = () => {
  const { offers, toggleOfferActive, deleteOffer, addOffer } = useStore();
  const [newOffer, setNewOffer] = useState({ code: '', discountType: 'flat' as const, discountValue: 0, minOrder: 0, active: true });

  const handleAdd = () => {
    if (newOffer.code && newOffer.discountValue > 0) {
      addOffer(newOffer);
      setNewOffer({ code: '', discountType: 'flat', discountValue: 0, minOrder: 0, active: true });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Offers Management</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div><label className="block text-sm">Code</label><input className="border p-2 rounded" value={newOffer.code} onChange={e => setNewOffer({...newOffer, code: e.target.value})} /></div>
        <div><label className="block text-sm">Type</label><select className="border p-2 rounded" value={newOffer.discountType} onChange={e => setNewOffer({...newOffer, discountType: e.target.value as any})}><option value="flat">Flat</option><option value="percentage">%</option></select></div>
        <div><label className="block text-sm">Value</label><input type="number" className="border p-2 rounded w-24" value={newOffer.discountValue} onChange={e => setNewOffer({...newOffer, discountValue: Number(e.target.value)})} /></div>
        <div><label className="block text-sm">Min Order</label><input type="number" className="border p-2 rounded w-24" value={newOffer.minOrder} onChange={e => setNewOffer({...newOffer, minOrder: Number(e.target.value)})} /></div>
        <button onClick={handleAdd} className="bg-primary-600 text-white px-4 py-2 rounded">Add</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Code</th>
              <th className="p-4 font-medium text-gray-600">Discount</th>
              <th className="p-4 font-medium text-gray-600">Min Order</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer.id} className="border-b border-gray-50 last:border-0">
                <td className="p-4 font-bold">{offer.code}</td>
                <td className="p-4">{offer.discountType === 'flat' ? `₹${offer.discountValue}` : `${offer.discountValue}%`}</td>
                <td className="p-4">₹{offer.minOrder}</td>
                <td className="p-4">
                  <button onClick={() => toggleOfferActive(offer.id)} className={`px-3 py-1 rounded-full text-sm ${offer.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {offer.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4"><button onClick={() => deleteOffer(offer.id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersManagement;
