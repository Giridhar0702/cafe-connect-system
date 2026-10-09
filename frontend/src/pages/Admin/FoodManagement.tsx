import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';

const FoodManagement: React.FC = () => {
  const { foods, deleteFood, toggleFoodAvailability } = useStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteFood(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Food Management</h1>
        <Link to="/admin/foods/add" className="bg-primary-600 text-white px-4 py-2 rounded-xl">Add Food</Link>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Category</th>
              <th className="p-4 font-medium text-gray-600">Price</th>

              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map(food => (
              <tr key={food.id} className="border-b border-gray-50 last:border-0">
                <td className="p-4 font-medium text-gray-900">{food.name}</td>
                <td className="p-4">{food.category}</td>
                <td className="p-4 font-medium">₹{food.price}</td>

                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => toggleFoodAvailability(food.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${food.available ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${food.available ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-medium ${food.available ? 'text-green-600' : 'text-gray-500'}`}>
                      {food.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex space-x-3">
                    <Link to={`/admin/foods/edit/${food.id}`} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleDelete(food.id)} className="text-red-600 hover:text-red-800 transition" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Trash2 className="w-6 h-6 text-red-500 mr-2" />
              Delete Food Item
            </h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this food item? This action cannot be undone.</p>
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

export default FoodManagement;
