import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { UserPlus, ToggleLeft, ToggleRight, Trash2, Edit2, Check, X, PhoneCall } from 'lucide-react';
import type { DeliveryPartner } from '../../types';

const DeliveryPartnersManagement: React.FC = () => {
  const { deliveryPartners, addDeliveryPartner, updateDeliveryPartner, toggleDeliveryPartnerActive, deleteDeliveryPartner } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      addDeliveryPartner({ name: formData.name, phone: formData.phone, active: true });
      setIsAdding(false);
      setFormData({ name: '', phone: '' });
    }
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      updateDeliveryPartner({ id, name: formData.name, phone: formData.phone, active: true });
      setEditingId(null);
      setFormData({ name: '', phone: '' });
    }
  };

  const startEdit = (partner: DeliveryPartner) => {
    setEditingId(partner.id);
    setFormData({ name: partner.name, phone: partner.phone });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Delivery Partners</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          {isAdding ? <X size={20} /> : <UserPlus size={20} />}
          <span>{isAdding ? 'Cancel' : 'Add Partner'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="text" 
              required
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">
            Save
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveryPartners.map(partner => (
          <div key={partner.id} className={`bg-white rounded-2xl p-5 border ${partner.active ? 'border-gray-200' : 'border-gray-200 opacity-75'} shadow-sm relative`}>
            {editingId === partner.id ? (
              <form onSubmit={(e) => handleEditSubmit(e, partner.id)} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input 
                    type="text" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <X size={16} />
                  </button>
                  <button type="submit" className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg">
                    <Check size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center">
                      {partner.name}
                      {!partner.active && <span className="ml-2 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Inactive</span>}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <PhoneCall className="w-3 h-3 mr-1" /> {partner.phone}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleDeliveryPartnerActive(partner.id)}
                    className={`p-1.5 rounded-full ${partner.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    title={partner.active ? 'Mark Inactive' : 'Mark Active'}
                  >
                    {partner.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
                
                <div className="flex border-t border-gray-100 pt-3 space-x-2">
                  <button 
                    onClick={() => startEdit(partner)}
                    className="flex-1 flex items-center justify-center space-x-1 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to delete this partner?')) {
                        deleteDeliveryPartner(partner.id);
                      }
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {deliveryPartners.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            No delivery partners added yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartnersManagement;
