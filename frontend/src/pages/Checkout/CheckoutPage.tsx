import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '../../store/StoreContext';
import { CreditCard, Wallet, Banknote, MapPin, Building, Home, Sun, Moon } from 'lucide-react';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  locationType: z.enum(['BIT_MINI_CAFE_BOYS', 'BIT_MINI_CAFE_GIRLS', 'BIT_QUARTERS', 'CUSTOM']),
  mealType: z.enum(['Lunch', 'Dinner']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  landmark: z.string().optional(),
  paymentMethod: z.enum(['UPI', 'Card', 'COD'])
}).superRefine((data, ctx) => {
  if (data.locationType === 'CUSTOM') {
    if (!data.address || data.address.length < 5) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Full address is required', path: ['address'] });
    if (!data.city || data.city.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'City is required', path: ['city'] });
    if (!data.state || data.state.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'State is required', path: ['state'] });
    if (!data.pincode || data.pincode.length < 6) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid pincode is required', path: ['pincode'] });
  }

  if (data.locationType === 'BIT_MINI_CAFE_BOYS' || data.locationType === 'BIT_MINI_CAFE_GIRLS') {
    if (!data.mealType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Lunch or Dinner', path: ['mealType'] });
    } else {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMins = minutes < 10 ? `0${minutes}` : minutes;
      const currentTimeStr = `${formattedHours}:${formattedMins} ${ampm}`;

      if (data.mealType === 'Lunch') {
        if (hours >= 11) {
          ctx.addIssue({ 
            code: z.ZodIssueCode.custom, 
            message: `Current time is ${currentTimeStr}. Lunch orders must be placed before 11:00 AM.`, 
            path: ['mealType'] 
          });
        }
      } else if (data.mealType === 'Dinner') {
        if (hours > 17 || (hours === 17 && minutes >= 30)) {
          ctx.addIssue({ 
            code: z.ZodIssueCode.custom, 
            message: `Current time is ${currentTimeStr}. Dinner orders must be placed before 5:30 PM.`, 
            path: ['mealType'] 
          });
        }
      }
    }
  }
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout: React.FC = () => {
  const { cart, placeOrder } = useStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      locationType: 'BIT_MINI_CAFE_BOYS',
      paymentMethod: 'UPI'
    }
  });

  const paymentMethod = watch('paymentMethod');
  const locationType = watch('locationType');
  const mealType = watch('mealType');

  // Clear meal type if location changes away from mini cafe
  React.useEffect(() => {
    if (locationType !== 'BIT_MINI_CAFE_BOYS' && locationType !== 'BIT_MINI_CAFE_GIRLS') {
      setValue('mealType', undefined);
    }
  }, [locationType, setValue]);

  if (cart.length === 0) {
    React.useEffect(() => { navigate('/cart'); }, [navigate]);
    return null;
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;

  const onSubmit = (data: CheckoutFormValues) => {
    let finalAddress = '';
    if (data.locationType === 'BIT_MINI_CAFE_BOYS') finalAddress = `BIT MINI CAFE - BOYS (${data.mealType})`;
    else if (data.locationType === 'BIT_MINI_CAFE_GIRLS') finalAddress = `BIT MINI CAFE - GIRLS (${data.mealType})`;
    else if (data.locationType === 'BIT_QUARTERS') finalAddress = 'BIT QUARTERS';
    else finalAddress = `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`;

    const orderData = {
      customerName: data.fullName,
      phone: data.phone,
      address: `${finalAddress}${data.landmark ? ` (Landmark: ${data.landmark})` : ''}`,
      items: cart,
      total,
      paymentMethod: data.paymentMethod
    };

    const orderId = placeOrder(orderData);
    navigate(`/order-success/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-12">
          {/* Form Fields */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input {...register('fullName')} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input {...register('phone')} type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Delivery Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${locationType === 'BIT_MINI_CAFE_BOYS' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" value="BIT_MINI_CAFE_BOYS" {...register('locationType')} className="hidden" />
                  <Building className={`w-6 h-6 ${locationType === 'BIT_MINI_CAFE_BOYS' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`ml-3 font-medium ${locationType === 'BIT_MINI_CAFE_BOYS' ? 'text-primary-700' : 'text-gray-700'}`}>BIT MINI CAFE - BOYS</span>
                </label>
                
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${locationType === 'BIT_MINI_CAFE_GIRLS' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" value="BIT_MINI_CAFE_GIRLS" {...register('locationType')} className="hidden" />
                  <Building className={`w-6 h-6 ${locationType === 'BIT_MINI_CAFE_GIRLS' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`ml-3 font-medium ${locationType === 'BIT_MINI_CAFE_GIRLS' ? 'text-primary-700' : 'text-gray-700'}`}>BIT MINI CAFE - GIRLS</span>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${locationType === 'BIT_QUARTERS' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" value="BIT_QUARTERS" {...register('locationType')} className="hidden" />
                  <Home className={`w-6 h-6 ${locationType === 'BIT_QUARTERS' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`ml-3 font-medium ${locationType === 'BIT_QUARTERS' ? 'text-primary-700' : 'text-gray-700'}`}>BIT QUARTERS</span>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${locationType === 'CUSTOM' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" value="CUSTOM" {...register('locationType')} className="hidden" />
                  <MapPin className={`w-6 h-6 ${locationType === 'CUSTOM' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`ml-3 font-medium ${locationType === 'CUSTOM' ? 'text-primary-700' : 'text-gray-700'}`}>Add Custom Address</span>
                </label>
              </div>

              {(locationType === 'BIT_MINI_CAFE_BOYS' || locationType === 'BIT_MINI_CAFE_GIRLS') && (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    Select Meal Type
                    <span className="ml-2 text-xs font-normal text-gray-500">(Required for Cafe Orders)</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition text-center ${mealType === 'Lunch' ? 'border-primary-500 bg-white ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <input type="radio" value="Lunch" {...register('mealType')} className="hidden" />
                      <Sun className={`w-8 h-8 mb-2 ${mealType === 'Lunch' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${mealType === 'Lunch' ? 'text-primary-700' : 'text-gray-700'}`}>Lunch</span>
                      <span className="text-xs text-gray-500 mt-1">Order before 11:00 AM</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition text-center ${mealType === 'Dinner' ? 'border-primary-500 bg-white ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <input type="radio" value="Dinner" {...register('mealType')} className="hidden" />
                      <Moon className={`w-8 h-8 mb-2 ${mealType === 'Dinner' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${mealType === 'Dinner' ? 'text-primary-700' : 'text-gray-700'}`}>Dinner</span>
                      <span className="text-xs text-gray-500 mt-1">Order before 5:30 PM</span>
                    </label>
                  </div>
                  {errors.mealType && (
                    <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg font-medium">
                      {errors.mealType.message}
                    </div>
                  )}
                </div>
              )}

              {locationType === 'CUSTOM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <textarea {...register('address')} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input {...register('city')} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input {...register('state')} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input {...register('pincode')} type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                    {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>}
                  </div>
                </div>
              )}

              <div className="mt-6 border-t pt-6 border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Room No / Landmark (Optional)</label>
                <input {...register('landmark')} type="text" placeholder="e.g. Room 102" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Payment Method</h2>
              <div className="space-y-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'UPI' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" value="UPI" {...register('paymentMethod')} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
                  <Wallet className="w-6 h-6 ml-4 text-gray-500" />
                  <span className="ml-3 font-medium text-gray-900">UPI</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'Card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" value="Card" {...register('paymentMethod')} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
                  <CreditCard className="w-6 h-6 ml-4 text-gray-500" />
                  <span className="ml-3 font-medium text-gray-900">Credit/Debit Card</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" value="COD" {...register('paymentMethod')} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
                  <Banknote className="w-6 h-6 ml-4 text-gray-500" />
                  <span className="ml-3 font-medium text-gray-900">Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity} × {item.name}</span>
                    <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-medium text-gray-900">₹{delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30"
              >
                Place Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
