import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext';
import { Package, Minus, Plus, Calendar, ArrowLeft } from 'lucide-react';
import type { FoodItem, DayOfWeek } from '../../types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const StockRow: React.FC<{ food: FoodItem, updateFood: (food: FoodItem) => void, selectedDay: DayOfWeek }> = ({ food, updateFood, selectedDay }) => {
  const currentLimit = food.dailyLimits?.[selectedDay];
  const [tempStock, setTempStock] = useState<string>(currentLimit != null ? currentLimit.toString() : '');

  // Reset temp stock when the selected day changes
  React.useEffect(() => {
    setTempStock(currentLimit != null ? currentLimit.toString() : '');
  }, [selectedDay, currentLimit]);

  const adjustTempStock = (amount: number) => {
    setTempStock(prev => {
      const current = prev === '' ? 0 : parseInt(prev);
      const next = Math.max(0, current + amount);
      return next.toString();
    });
  };

  const saveStock = () => {
    const limitVal = tempStock.trim() === '' ? undefined : parseInt(tempStock);
    
    const updatedFood = {
      ...food,
      dailyLimits: {
        ...(food.dailyLimits || {}),
        [selectedDay]: limitVal
      }
    };
    
    // If the admin is editing TODAY'S limit, also reset the current tracking stock
    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
    if (selectedDay === currentDayName) {
      updatedFood.stock = limitVal;
      updatedFood.lastStockReset = new Date().toISOString().split('T')[0];
      if (limitVal === 0) {
        updatedFood.available = false;
      } else if (limitVal !== undefined && limitVal > 0) {
        updatedFood.available = true;
      }
    }
    
    updateFood(updatedFood);
  };

  const hasChanges = tempStock !== (currentLimit != null ? currentLimit.toString() : '');

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
      <td className="p-4 font-medium text-gray-900">{food.name}</td>
      <td className="p-4 text-gray-600">{food.category}</td>
      <td className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          food.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {food.available ? 'Available' : 'Unavailable'}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => adjustTempStock(-1)}
            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2 w-24 text-center focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Unlimited"
            value={tempStock}
            onChange={(e) => setTempStock(e.target.value)}
          />
          <button 
            onClick={() => adjustTempStock(1)}
            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </td>
      <td className="p-4">
        <button
          onClick={saveStock}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            hasChanges 
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {hasChanges ? 'Save Changes' : 'Saved'}
        </button>
      </td>
    </tr>
  );
};

const StockManagement: React.FC = () => {
  const { foods, updateFood } = useStore();
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayName);
  const [view, setView] = useState<'days' | 'menu'>('days');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Package className="w-6 h-6 mr-3 text-primary-600" />
          Daily Stock Limits
        </h1>
        {view === 'menu' && (
          <button 
            onClick={() => setView('days')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Days
          </button>
        )}
      </div>

      {view === 'days' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                setView('menu');
              }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group text-left flex flex-col justify-between h-32"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-xl text-gray-800 group-hover:text-primary-600 transition-colors">
                  {day}
                </span>
                <div className={`p-2 rounded-xl ${day === todayName ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              {day === todayName && (
                <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full w-max">
                  Today
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center">
            <Calendar className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-primary-900">
              Editing Stock Limits for <span className="font-bold">{selectedDay}</span>
            </span>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-medium text-gray-600">Food Name</th>
                    <th className="p-4 font-medium text-gray-600">Category</th>
                    <th className="p-4 font-medium text-gray-600">Current Status</th>
                    <th className="p-4 font-medium text-gray-600">Daily Stock Limit</th>
                    <th className="p-4 font-medium text-gray-600 w-48">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map(food => (
                    <StockRow key={food.id} food={food} updateFood={updateFood} selectedDay={selectedDay} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
