import React from 'react';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-64 sm:h-96 w-full relative">
            <img 
              src="/shop-outdoor.jpg" 
              alt="Ela Cafe Outdoor Area" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight text-center px-4">
                About Elai Virundhu
              </h1>
            </div>
          </div>

          <div className="p-8 md:p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed text-center">
              Welcome to Elai Virundhu! We are passionate about serving the most delicious and authentic dishes that bring people together. 
              Our journey started with a simple belief: great food creates great memories. Our master chefs use only the freshest, locally sourced ingredients, carefully selected to create memorable culinary experiences for you and your family. 
              Whether you're craving a quick bite or planning a grand feast, we are here to serve you with joy and perfection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="rounded-2xl overflow-hidden shadow-sm h-64">
                <img src="/shop-outdoor.jpg" alt="Outdoor Seating" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm h-64">
                <img src="/shop-night.jpg" alt="Night View" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            <hr className="border-gray-200 my-12" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-primary-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Location</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  F6PW+VPP, Sanarpathi, Ariyappampalayam<br/>
                  Tamil Nadu 638402<br/>
                  <span className="text-gray-500 block mt-2">(located on the Sathy to Gobi Main Road, right opposite the Royal Enfield showroom)</span>
                </p>
              </div>

              <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-primary-600">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Opening Hours</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex justify-between"><span>Monday - Friday</span> <span>11:00 AM - 11:00 PM</span></li>
                  <li className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 11:30 PM</span></li>
                  <li className="flex justify-between"><span>Sunday</span> <span>10:00 AM - 11:30 PM</span></li>
                </ul>
              </div>

              <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100 md:col-span-2 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Get in Touch</h3>
                  <p className="text-gray-700">Follow us or reach out anytime!</p>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end gap-4">
                  <a href="https://www.instagram.com/elai_virundhu_sathyamangalam/" target="_blank" rel="noopener noreferrer" className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl shadow-sm text-white font-bold hover:shadow-lg hover:scale-105 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                    Instagram
                  </a>
                  <a href="tel:+919876543210" className="flex items-center px-6 py-3 bg-white rounded-xl shadow-sm text-gray-900 font-medium hover:text-primary-600 transition">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Us
                  </a>
                  <a href="mailto:support@elaivirundhu.com" className="flex items-center px-6 py-3 bg-white rounded-xl shadow-sm text-gray-900 font-medium hover:text-primary-600 transition">
                    <Mail className="w-5 h-5 mr-2" />
                    Email
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
