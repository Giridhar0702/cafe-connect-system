import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import type { DeliveryLocation } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';

const formatTime = (time?: string) => {
  if (!time) return 'N/A';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const fmtH = h % 12 || 12;
  const fmtM = m < 10 ? `0${m}` : m;
  return `${fmtH}:${fmtM} ${ampm}`;
};

const LocationsManagement: React.FC = () => {
  const { locations, addLocation, updateLocation, toggleLocationActive, deleteLocation } = useStore();
  const defaultNewLoc = { name: '', type: 'CAFE', requiresMealType: true, offersBreakfast: true, offersLunch: true, offersDinner: true, active: true, breakfastCutoff: '08:30', lunchCutoff: '11:00', dinnerCutoff: '17:30' } as Partial<DeliveryLocation>;
  const [newLoc, setNewLoc] = useState<Partial<DeliveryLocation>>(defaultNewLoc);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    if (newLoc.name) {
      if (editingId) {
        updateLocation({ ...newLoc, id: editingId } as DeliveryLocation);
        setEditingId(null);
      } else {
        addLocation(newLoc as Omit<DeliveryLocation, 'id'>);
      }
      setNewLoc(defaultNewLoc);
    }
  };

  const handleEdit = (loc: DeliveryLocation) => {
    setNewLoc(loc);
    setEditingId(loc.id);
  };
  
  const handleCancelEdit = () => {
    setNewLoc(defaultNewLoc);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteLocation(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Delivery Locations Management</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Location Name</label>
          <input className="border border-gray-300 p-2 rounded-xl w-full" value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})} placeholder="e.g. BIT MINI CAFE - BOYS" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select className="border border-gray-300 p-2 rounded-xl" value={newLoc.type} onChange={e => setNewLoc({...newLoc, type: e.target.value as any, requiresMealType: e.target.value === 'CAFE'})}>
            <option value="CAFE">Cafe (Requires Meal Type)</option>
            <option value="QUARTERS">Quarters</option>
            <option value="CUSTOM">Custom Address</option>
          </select>
        </div>
        <div className="flex items-center h-10 px-2 space-x-2">
          <input type="checkbox" id="reqMeal" checked={newLoc.requiresMealType} onChange={e => setNewLoc({...newLoc, requiresMealType: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
          <label htmlFor="reqMeal" className="text-sm font-medium">Requires Meal Type</label>
        </div>
        
        {newLoc.requiresMealType && (
          <div className="flex space-x-4 w-full">
            <div className="flex-1 border border-gray-100 p-4 rounded-xl bg-gray-50">
              <div className="flex items-center mb-2">
                <input type="checkbox" id="offB" checked={newLoc.offersBreakfast} onChange={e => setNewLoc({...newLoc, offersBreakfast: e.target.checked})} className="mr-2" />
                <label htmlFor="offB" className="text-sm font-bold">Offers Breakfast</label>
              </div>
              <input type="time" disabled={!newLoc.offersBreakfast} className="border border-gray-300 p-2 rounded-xl w-full disabled:opacity-50" value={newLoc.breakfastCutoff || ''} onChange={e => setNewLoc({...newLoc, breakfastCutoff: e.target.value})} />
            </div>
            <div className="flex-1 border border-gray-100 p-4 rounded-xl bg-gray-50">
              <div className="flex items-center mb-2">
                <input type="checkbox" id="offL" checked={newLoc.offersLunch} onChange={e => setNewLoc({...newLoc, offersLunch: e.target.checked})} className="mr-2" />
                <label htmlFor="offL" className="text-sm font-bold">Offers Lunch</label>
              </div>
              <input type="time" disabled={!newLoc.offersLunch} className="border border-gray-300 p-2 rounded-xl w-full disabled:opacity-50" value={newLoc.lunchCutoff || ''} onChange={e => setNewLoc({...newLoc, lunchCutoff: e.target.value})} />
            </div>
            <div className="flex-1 border border-gray-100 p-4 rounded-xl bg-gray-50">
              <div className="flex items-center mb-2">
                <input type="checkbox" id="offD" checked={newLoc.offersDinner} onChange={e => setNewLoc({...newLoc, offersDinner: e.target.checked})} className="mr-2" />
                <label htmlFor="offD" className="text-sm font-bold">Offers Dinner</label>
              </div>
              <input type="time" disabled={!newLoc.offersDinner} className="border border-gray-300 p-2 rounded-xl w-full disabled:opacity-50" value={newLoc.dinnerCutoff || ''} onChange={e => setNewLoc({...newLoc, dinnerCutoff: e.target.value})} />
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          {editingId && (
            <button onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 font-bold transition">Cancel</button>
          )}
          <button onClick={handleSave} className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 font-bold transition">
            {editingId ? 'Update Location' : 'Add Location'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Location Name</th>
              <th className="p-4 font-medium text-gray-600">Type</th>
              <th className="p-4 font-medium text-gray-600">Cutoff Times</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id} className="border-b border-gray-50 last:border-0">
                <td className="p-4 font-bold">{loc.name}</td>
                <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-sm">{loc.type}</span></td>
                <td className="p-4 text-sm text-gray-600">
                  {loc.requiresMealType ? (
                    <div className="flex flex-wrap gap-2">
                      {loc.offersBreakfast && <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-bold border border-orange-200">Breakfast: {formatTime(loc.breakfastCutoff)}</span>}
                      {loc.offersLunch && <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-bold border border-orange-200">Lunch: {formatTime(loc.lunchCutoff)}</span>}
                      {loc.offersDinner && <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-bold border border-orange-200">Dinner: {formatTime(loc.dinnerCutoff)}</span>}
                    </div>
                  ) : (
                    <span className="italic">Not Required</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => toggleLocationActive(loc.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${loc.active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${loc.active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-medium ${loc.active ? 'text-green-600' : 'text-gray-500'}`}>
                      {loc.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex space-x-3">
                    <button onClick={() => handleEdit(loc)} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:text-red-800 transition" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No locations added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Trash2 className="w-6 h-6 text-red-500 mr-2" />
              Delete Location
            </h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this location? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsManagement;
