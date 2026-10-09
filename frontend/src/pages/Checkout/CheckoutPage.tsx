import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '../../store/StoreContext';
import { CreditCard, Wallet, Banknote, MapPin, Building, Home, Sun, Moon, Coffee } from 'lucide-react';

const isCutoffPassed = (cutoff?: string) => {
  if (!cutoff) return false;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const [cutoffHours, cutoffMinutes] = cutoff.split(':').map(Number);
  return hours > cutoffHours || (hours === cutoffHours && minutes >= cutoffMinutes);
};

const formatCutoff = (cutoff?: string) => {
  if (!cutoff) return 'N/A';
  const [h, m] = cutoff.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const fmtH = h % 12 || 12;
  const fmtM = m < 10 ? `0${m}` : m;
  return `${fmtH}:${fmtM} ${ampm}`;
};

type CheckoutFormValues = {
  fullName: string;
  phone: string;
  locationType: string;
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  paymentMethod: 'UPI' | 'Card' | 'COD';
};

const Checkout: React.FC = () => {
  const { cart, placeOrder, locations } = useStore();
  const navigate = useNavigate();

  const checkoutSchema = React.useMemo(() => {
    return z.object({
      fullName: z.string().min(2, 'Name is required'),
      phone: z.string().min(10, 'Valid phone number is required'),
      locationType: z.string().min(1, 'Location is required'),
      mealType: z.enum(['Breakfast', 'Lunch', 'Dinner']).optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      landmark: z.string().optional(),
      paymentMethod: z.enum(['UPI', 'Card', 'COD'])
    }).superRefine((data, ctx) => {
      const selectedLoc = locations.find(l => l.id === data.locationType);
      
      if (selectedLoc?.type === 'CUSTOM') {
        if (!data.address || data.address.length < 5) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Full address is required', path: ['address'] });
        if (!data.city || data.city.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'City is required', path: ['city'] });
        if (!data.state || data.state.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'State is required', path: ['state'] });
        if (!data.pincode || data.pincode.length < 6) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid pincode is required', path: ['pincode'] });
      }
    
      if (selectedLoc?.requiresMealType) {
        if (!data.mealType) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a Meal Type', path: ['mealType'] });
        } else {
          let cutoff = '';
          let mealName = '';
          
          if (data.mealType === 'Breakfast') {
            if (!selectedLoc.offersBreakfast) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Breakfast is not offered here.', path: ['mealType'] });
              return;
            }
            cutoff = selectedLoc.breakfastCutoff || '';
            mealName = 'Breakfast';
          } else if (data.mealType === 'Lunch') {
            if (!selectedLoc.offersLunch) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Lunch is not offered here.', path: ['mealType'] });
              return;
            }
            cutoff = selectedLoc.lunchCutoff || '';
            mealName = 'Lunch';
          } else if (data.mealType === 'Dinner') {
            if (!selectedLoc.offersDinner) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Dinner is not offered here.', path: ['mealType'] });
              return;
            }
            cutoff = selectedLoc.dinnerCutoff || '';
            mealName = 'Dinner';
          }

          if (cutoff && isCutoffPassed(cutoff)) {
            const now = new Date();
            const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
            const fmtH = now.getHours() % 12 || 12;
            const fmtM = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
            const currentTimeStr = `${fmtH}:${fmtM} ${ampm}`;

            ctx.addIssue({ 
              code: z.ZodIssueCode.custom, 
              message: `Current time is ${currentTimeStr}. ${mealName} orders must be placed before ${formatCutoff(cutoff)}.`, 
              path: ['mealType'] 
            });
          }
        }
      }
    });
  }, [locations]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      locationType: locations.find(l => l.active)?.id || '',
      paymentMethod: 'UPI'
    }
  });

  const paymentMethod = watch('paymentMethod');
  const locationType = watch('locationType');
  const mealType = watch('mealType');

  const selectedLocation = locations.find(l => l.id === locationType);

  const isBreakfastDisabled = isCutoffPassed(selectedLocation?.breakfastCutoff);
  const isLunchDisabled = isCutoffPassed(selectedLocation?.lunchCutoff);
  const isDinnerDisabled = isCutoffPassed(selectedLocation?.dinnerCutoff);

  const offeredMealsCount = [selectedLocation?.offersBreakfast, selectedLocation?.offersLunch, selectedLocation?.offersDinner].filter(Boolean).length;
  const gridColsClass = offeredMealsCount === 1 ? 'sm:grid-cols-1' : offeredMealsCount === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';

  // Clear meal type if location changes away from cafe
  React.useEffect(() => {
    if (selectedLocation && !selectedLocation.requiresMealType) {
      setValue('mealType', undefined);
    }
  }, [selectedLocation, setValue]);

  // Prevent redirecting back to cart if the cart was cleared because an order was successfully placed
  const isOrderPlaced = React.useRef(false);

  React.useEffect(() => { 
    if (cart.length === 0 && !isOrderPlaced.current) {
      navigate('/cart'); 
    }
  }, [cart.length, navigate]);

  if (cart.length === 0) {
    return null;
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const cgst = subtotal * 0.025; // 2.5% CGST
  const sgst = subtotal * 0.025; // 2.5% SGST
  const exactTotal = subtotal + delivery + cgst + sgst;
  const total = Math.ceil(exactTotal); // Round to greater integer

  const onSubmit = (data: CheckoutFormValues) => {
    const loc = locations.find(l => l.id === data.locationType);
    let finalAddress = '';
    
    if (loc?.type === 'CUSTOM') {
      finalAddress = `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`;
    } else {
      finalAddress = loc?.name || '';
      if (loc?.requiresMealType) {
        finalAddress += ` (${data.mealType})`;
      }
    }

    const orderData = {
      customerName: data.fullName,
      phone: data.phone,
      address: `${finalAddress}${data.landmark ? ` (Landmark: ${data.landmark})` : ''}`,
      items: cart,
      total,
      paymentMethod: data.paymentMethod
    };

    const orderId = placeOrder(orderData);
    isOrderPlaced.current = true;
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
                {locations.filter(l => l.active).map(loc => {
                  let Icon = Building;
                  if (loc.type === 'QUARTERS') Icon = Home;
                  if (loc.type === 'CUSTOM') Icon = MapPin;
                  
                  return (
                    <label key={loc.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${locationType === loc.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" value={loc.id} {...register('locationType')} className="hidden" />
                      <Icon className={`w-6 h-6 ${locationType === loc.id ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className={`ml-3 font-medium ${locationType === loc.id ? 'text-primary-700' : 'text-gray-700'}`}>{loc.name}</span>
                    </label>
                  );
                })}
              </div>

              {selectedLocation?.requiresMealType && (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    Select Meal Type
                    <span className="ml-2 text-xs font-normal text-gray-500">(Required for Cafe Orders)</span>
                  </h3>
                  <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
                    {selectedLocation?.offersBreakfast && (
                      <label className={`flex flex-col items-center justify-center p-4 border rounded-xl transition text-center ${isBreakfastDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'cursor-pointer ' + (mealType === 'Breakfast' ? 'border-primary-500 bg-white ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50')}`}>
                        <input type="radio" value="Breakfast" {...register('mealType')} disabled={isBreakfastDisabled} className="hidden" />
                        <Coffee className={`w-8 h-8 mb-2 ${mealType === 'Breakfast' ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${mealType === 'Breakfast' ? 'text-primary-700' : 'text-gray-700'}`}>Breakfast</span>
                        <span className="text-xs text-gray-500 mt-1">Order before {formatCutoff(selectedLocation?.breakfastCutoff)}</span>
                      </label>
                    )}
                    {selectedLocation?.offersLunch && (
                      <label className={`flex flex-col items-center justify-center p-4 border rounded-xl transition text-center ${isLunchDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'cursor-pointer ' + (mealType === 'Lunch' ? 'border-primary-500 bg-white ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50')}`}>
                        <input type="radio" value="Lunch" {...register('mealType')} disabled={isLunchDisabled} className="hidden" />
                        <Sun className={`w-8 h-8 mb-2 ${mealType === 'Lunch' ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${mealType === 'Lunch' ? 'text-primary-700' : 'text-gray-700'}`}>Lunch</span>
                        <span className="text-xs text-gray-500 mt-1">Order before {formatCutoff(selectedLocation?.lunchCutoff)}</span>
                      </label>
                    )}
                    {selectedLocation?.offersDinner && (
                      <label className={`flex flex-col items-center justify-center p-4 border rounded-xl transition text-center ${isDinnerDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'cursor-pointer ' + (mealType === 'Dinner' ? 'border-primary-500 bg-white ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50')}`}>
                        <input type="radio" value="Dinner" {...register('mealType')} disabled={isDinnerDisabled} className="hidden" />
                        <Moon className={`w-8 h-8 mb-2 ${mealType === 'Dinner' ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${mealType === 'Dinner' ? 'text-primary-700' : 'text-gray-700'}`}>Dinner</span>
                        <span className="text-xs text-gray-500 mt-1">Order before {formatCutoff(selectedLocation?.dinnerCutoff)}</span>
                      </label>
                    )}
                  </div>
                  {errors.mealType && (
                    <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg font-bold shadow-sm border border-red-200">
                      {errors.mealType.message}
                    </div>
                  )}
                </div>
              )}

              {selectedLocation?.type === 'CUSTOM' && (
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
                  <span>CGST (2.5%)</span>
                  <span className="font-medium text-gray-900">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%)</span>
                  <span className="font-medium text-gray-900">₹{sgst.toFixed(2)}</span>
                </div>
                {exactTotal !== total && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Rounding</span>
                    <span>+₹{(total - exactTotal).toFixed(2)}</span>
                  </div>
                )}
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
