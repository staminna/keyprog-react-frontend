import React from 'react';
import { ContactInfoEditor } from '@/components/contacts/ContactInfoEditor';
import { PageLayout } from '@/components/layout/PageLayout';

/**
 * Contact page with bidirectional editing capabilities
 */
const ContactPage: React.FC = () => {
  return (
    <PageLayout title="Contact Us">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Contact Information</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Editor */}
          <div className="lg:col-span-2">
            <ContactInfoEditor className="bg-white shadow-md rounded-lg p-6" />
          </div>
          
          {/* Contact Form */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Your email"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Your message"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-12 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Find Us</h2>
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-md">
            {/* Placeholder for map - in a real app, you would integrate Google Maps or similar */}
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Map integration would go here</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">Address</h3>
              <p className="text-gray-600">123 Main Street, Lisbon, Portugal</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Business Hours</h3>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
              <p className="text-gray-600">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
