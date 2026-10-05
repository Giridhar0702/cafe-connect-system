import React, { useState } from 'react';
import { User, MapPin, Package, Star } from 'lucide-react';
import { useStore } from '../../store/StoreContext';

const Profile: React.FC = () => {
  const { orders, reviews } = useStore();
  const [activeTab, setActiveTab] = useState('Personal');
  
  // Mock User
  const [user, setUser] = useState({
    name: 'Giridhar',
    email: 'giridhar@example.com',
    phone: '9876543210',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
                  <User className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                
                <div className="w-full space-y-2">
                  <button onClick={() => setActiveTab('Personal')} className={`w-full flex items-center p-3 rounded-xl transition font-medium ${activeTab === 'Personal' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <User className="w-5 h-5 mr-3" /> Personal Info
                  </button>
                  <button onClick={() => setActiveTab('Addresses')} className={`w-full flex items-center p-3 rounded-xl transition font-medium ${activeTab === 'Addresses' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <MapPin className="w-5 h-5 mr-3" /> Saved Addresses
                  </button>
                  <button onClick={() => setActiveTab('Orders')} className={`w-full flex items-center p-3 rounded-xl transition font-medium ${activeTab === 'Orders' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Package className="w-5 h-5 mr-3" /> Order History
                  </button>
                  <button onClick={() => setActiveTab('Reviews')} className={`w-full flex items-center p-3 rounded-xl transition font-medium ${activeTab === 'Reviews' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Star className="w-5 h-5 mr-3" /> My Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 min-h-[500px]">
              
              {activeTab === 'Personal' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={user.name}
                        onChange={(e) => setUser({...user, name: e.target.value})}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={user.email}
                        onChange={(e) => setUser({...user, email: e.target.value})}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={user.phone}
                        onChange={(e) => setUser({...user, phone: e.target.value})}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500" 
                      />
                    </div>
                    {isEditing && (
                      <button type="submit" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md">
                        Save Changes
                      </button>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'Addresses' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Addresses</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border-2 border-primary-500 rounded-2xl p-5 relative bg-primary-50">
                      <span className="absolute top-4 right-4 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded">Default</span>
                      <h3 className="font-bold text-gray-900 mb-2">Home</h3>
                      <p className="text-gray-600 text-sm mb-4">123 Main St, City, State - 123456</p>
                      <div className="flex space-x-3 text-sm">
                        <button className="text-primary-600 font-medium">Edit</button>
                        <button className="text-red-500 font-medium">Delete</button>
                      </div>
                    </div>
                    <button className="border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition min-h-[140px]">
                      <span className="text-2xl mb-2">+</span>
                      <span className="font-medium">Add New Address</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                      <button 
                        onClick={() => window.location.href = '/menu'} 
                        className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                      >
                        Start Ordering
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
                          <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                            <div>
                              <p className="font-bold text-gray-900 text-lg">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <p className="font-extrabold text-primary-600 text-lg">₹{order.total}</p>
                              <span className={`mt-1 text-xs font-bold px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Items Ordered:</p>
                            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                              {order.items.map((item: any, index: number) => (
                                <li key={index}>{item.quantity} × {item.name}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex justify-end pt-2">
                            <button 
                              onClick={() => window.location.href = `/orders/${order.id}`}
                              className="px-5 py-2 border border-primary-500 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                            >
                              Track Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h2>
                  <div className="space-y-4">
                    {reviews.filter(r => r.customerName === user.name).map(review => (
                      <div key={review.id} className="border border-gray-200 rounded-2xl p-5">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{review.foodName}</h3>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">"{review.comment}"</p>
                        <p className="text-xs text-gray-400">{review.date}</p>
                      </div>
                    ))}
                    {reviews.filter(r => r.customerName === user.name).length === 0 && (
                      <p className="text-gray-500 text-center py-8">You haven't submitted any reviews yet.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
