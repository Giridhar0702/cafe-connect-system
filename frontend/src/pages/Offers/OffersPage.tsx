import React from 'react';
import { useStore } from '../../store/StoreContext';
import { Tag, Percent, IndianRupee, Copy, CheckCircle } from 'lucide-react';

const Offers: React.FC = () => {
  const { offers } = useStore();
  const activeOffers = offers.filter(offer => offer.active);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Current Offers & Coupons</h1>
          <p className="text-lg text-gray-600">
            Apply these coupon codes at checkout to get amazing discounts on your favorite meals!
          </p>
        </div>

        {activeOffers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Offers Right Now</h2>
            <p className="text-gray-500">Check back later for exciting discounts and seasonal promos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeOffers.map(offer => (
              <div key={offer.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col relative group">
                {/* Ribbon */}
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  Save {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                </div>
                
                <div className="p-8 bg-gradient-to-br from-primary-50 to-white flex-grow flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-primary-600 transform group-hover:scale-110 transition-transform">
                    {offer.discountType === 'percentage' ? <Percent className="w-8 h-8" /> : <IndianRupee className="w-8 h-8" />}
                  </div>
                  
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-wide uppercase">
                    {offer.code}
                  </h3>
                  
                  <p className="text-gray-600 font-medium mb-6">
                    Get {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`} on your next order!
                  </p>

                  <div className="w-full bg-gray-50 rounded-xl p-4 mt-auto border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Condition:</p>
                    <p className="text-gray-900 font-bold">Min. Order ₹{offer.minOrder}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                  <button
                    onClick={() => copyToClipboard(offer.code)}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-colors ${
                      copiedCode === offer.code 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Code Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
