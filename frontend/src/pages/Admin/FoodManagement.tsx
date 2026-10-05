import React from 'react';
import { useStore } from '../../store/StoreContext';
import { Link } from 'react-router-dom';

const FoodManagement: React.FC = () => {
  const { foods, deleteFood, toggleFoodAvailability } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Food Management</h1>
        <Link to="/admin/foods/add" className="bg-primary-600 text-white px-4 py-2 rounded-xl">Add Food</Link>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
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
                <td className="p-4">{food.name}</td>
                <td className="p-4">{food.category}</td>
                <td className="p-4">₹{food.price}</td>
                <td className="p-4">
                  <button onClick={() => toggleFoodAvailability(food.id)} className={`px-3 py-1 rounded-full text-sm ${food.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {food.available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td className="p-4 space-x-2">
                  <Link to={`/admin/foods/edit/${food.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <button onClick={() => deleteFood(food.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoodManagement;
