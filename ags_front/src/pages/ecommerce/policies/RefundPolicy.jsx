import React from "react";
import PolicyLayout from "../PolicyLayout";
import {
  RotateCcw,
  Leaf,
  Package,
  Shield,
  Lock,
  CreditCard,
  PhoneCall,
  Mail
} from "lucide-react";

const RefundPolicy = () => {
  const refundPolicyContent = [
    {
      title: "Order Cancellation",
      icon: RotateCcw,
      content: "Cancellations are accepted within 24 hours of placing the order. Orders cannot be cancelled once they are packed, shipped, or out for delivery. You may reject the product at the doorstep if it is already out for delivery."
    },
    {
      title: "Perishable Items",
      icon: Leaf,
      content: "We do not accept cancellations for perishable items such as fresh foods or eatables. Refunds or replacements are only offered if the delivered product is spoiled or of poor quality."
    },
    {
      title: "Damaged or Defective Products",
      icon: Package,
      content: "If you receive a damaged or defective product, please report it within 48 hours of delivery. A replacement or refund will be processed after verification."
    },
    {
      title: "Product Not as Expected",
      icon: Shield,
      content: "If the product does not meet your expectations, contact customer support within 48 hours. Our team will review your request and take appropriate action."
    },
    {
      title: "Refund Processing",
      icon: CreditCard,
      content: "All approved refunds will be processed within 7–10 business days to the original payment method used during purchase."
    }
  ];

  return (
    <PolicyLayout
      title="Cancellation & Refund Policy"
      subtitle="Our policies on cancellations and refunds"
      icon={RotateCcw}
      gradientFrom="from-purple-600"
      gradientTo="to-pink-600"
    >
      <div className="space-y-8">
        <div className="mb-8">
          <p className="text-gray-600 text-xs leading-relaxed">
            At AG's Healthy Foods, we want you to be completely satisfied with your purchase. This policy outlines the terms and conditions for cancellations and refunds.
          </p>
        </div>

        <div className="space-y-6">
          {refundPolicyContent.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-3 border border-gray-200 hover:border-purple-200 transition-colors"
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <SectionIcon size={22} className="text-purple-600" />
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <PhoneCall size={24} className="text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
            </div>
            <p className="text-gray-600 text-xs mb-4">
              For any refund or cancellation related queries, please contact our customer support:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500" />
                <a href="mailto:agshealthyfoods@gmail.com" className="text-purple-600 hover:underline text-xs">
                  agshealthyfoods@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall size={18} className="text-gray-500" />
                <a href="tel:+919943311192" className="text-purple-600 hover:underline text-xs">
                  +91 99433 11192
                </a>
              </div>
              <p className="text-gray-600 text-xs ml-7">
                Ag's Healthy Foods – Customer Support, No. 40 A Mahalakshmi Nagar South, Palpannaicherry, Nagapattinam – 611001
              </p>
            </div>
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};

export default RefundPolicy;