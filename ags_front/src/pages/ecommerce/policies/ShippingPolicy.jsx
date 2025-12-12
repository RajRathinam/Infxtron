import React from "react";
import PolicyLayout from "../PolicyLayout";
import {
  Truck,
  Clock,
  Package,
  MapPin,
  FileText,
  CreditCard,
  PhoneCall,
  Mail
} from "lucide-react";

const ShippingPolicy = () => {
  const shippingPolicyContent = [
    {
      title: "Shipping Method",
      icon: Truck,
      content: "All orders are shipped through our delivery partners. We ensure safe and timely delivery through trusted delivery partners."
    },
{
  title: "Order Processing Time",
  icon: Clock,
  content: "Get your order delivered within 4 hours from order placement. Available for select products and locations at checkout."
},
    {
      title: "Delivery Timelines",
      icon: Package,
      content: "Delivery timelines depend on courier or postal service norms. Ag's Healthy Foods shall not be liable for delays caused by delivery partners, traffic, weather conditions, or unforeseen situations."
    },
    {
      title: "Delivery Address",
      icon: MapPin,
      content: "Orders will be delivered to the address provided by the customer during checkout. Please ensure accurate address and contact information to avoid delivery issues."
    },
    {
      title: "Delivery Confirmation",
      icon: FileText,
      content: "You will receive order and delivery confirmation on your registered Whatsapp Number, including order details and tracking information (if available)."
    },
    {
      title: "Shipping Charges",
      icon: CreditCard,
      content: "Applicable shipping charges will be displayed during checkout. Shipping fees, once paid, are non-refundable."
    }
  ];

  return (
    <PolicyLayout
      title="Shipping Policy"
      subtitle="How we deliver your orders"
      icon={Truck}
      gradientFrom="from-blue-600"
      gradientTo="to-indigo-600"
    >
      <div className="space-y-8">
        <div className="mb-8">
          <p className="text-gray-600 text-xs leading-relaxed">
            At AG's Healthy Foods, we strive to deliver your orders promptly and safely. This Shipping Policy outlines our delivery process, timelines, and other important information about shipping.
          </p>
        </div>

        <div className="space-y-6">
          {shippingPolicyContent.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-3 border border-gray-200 hover:border-blue-200 transition-colors"
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <SectionIcon size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 text-xs text-justify leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <PhoneCall size={24} className="text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-gray-600 text-xs mb-4">
              For any issues related to shipping, delivery, or your order status, please contact:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PhoneCall size={18} className="text-gray-500" />
                <a href="tel:+919943311192" className="text-blue-600 hover:underline text-xs">
                  +91 99433 11192
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500" />
                <a href="mailto:agshealthyfoods@gmail.com" className="text-blue-600 hover:underline text-xs">
                  agshealthyfoods@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};

export default ShippingPolicy;