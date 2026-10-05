import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '../../store/StoreContext';

const foodSchema = z.object({
  name: z.string().min(2, 'Food name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  prepTime: z.coerce.number().positive('Preparation time must be greater than 0'),
  imageUrl: z.string().url('Valid image URL is required'),
  available: z.boolean(),
  featured: z.boolean(),
});

type FoodFormValues = z.infer<typeof foodSchema>;

const EditFood: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { foods, categories, updateFood } = useStore();
  const navigate = useNavigate();
  
  const food = foods.find(f => f.id === id);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FoodFormValues>({
    resolver: zodResolver(foodSchema) as any,
  });

  useEffect(() => {
    if (food) {
      reset({
        name: food.name,
        category: food.category,
        price: food.price,
        description: food.description,
        prepTime: food.prepTime,
        imageUrl: food.imageUrl,
        available: food.available,
        featured: food.featured,
      });
    }
  }, [food, reset]);

  if (!food) {
    return <div className="p-8 text-center text-gray-500">Food not found</div>;
  }

  const onSubmit = (data: FoodFormValues) => {
    updateFood({
      ...food,
      ...data,
    });
    navigate('/admin/foods');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Food: {food.name}</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
              <input {...register('name')} type="text" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category')} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input {...register('price')} type="number" step="0.01" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500" />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={3} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500" />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes)</label>
              <input {...register('prepTime')} type="number" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500" />
              {errors.prepTime && <p className="mt-1 text-sm text-red-600">{errors.prepTime.message}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Image URL</label>
              <input {...register('imageUrl')} type="url" placeholder="https://..." className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500" />
              {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
            </div>

            <div className="flex items-center space-x-8 md:col-span-2 p-4 bg-gray-50 rounded-xl">
              <label className="flex items-center cursor-pointer">
                <input {...register('available')} type="checkbox" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                <span className="ml-3 font-medium text-gray-900">Available 🟢</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input {...register('featured')} type="checkbox" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                <span className="ml-3 font-medium text-gray-900">Featured (Show on Home) ⭐</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => navigate('/admin/foods')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-500/30"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFood;
