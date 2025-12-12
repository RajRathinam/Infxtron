import React from "react";
import PolicyLayout from "../PolicyLayout";
import {
  RefreshCw,
  AlertCircle,
  Leaf,
  AlertTriangle,
  CheckCircle,
  PhoneCall,
  Clock,
  ShieldCheck,
  PackageCheck,
  Mail
} from "lucide-react";

const ReturnPolicy = () => {
  const returnRefundPolicyContent = [
    {
      title: "Important Notice",
      icon: AlertCircle,
      content: "At AG's Healthy Foods, we take great care to ensure that all our food products are prepared, packed, and delivered under the highest standards of quality and hygiene.",
      highlight: true
    },
    {
      title: "Perishable Food Items",
      icon: Leaf,
      content: "Since our products are perishable food items, we do not accept returns once an order has been delivered.",
      highlight: true
    },
    {
      title: "Damaged or Incorrect Products",
      icon: AlertTriangle,
      content: "If you receive a damaged, spoiled, or incorrect product, please contact us on the same day of delivery with relevant details and proof (such as photos or videos).",
      highlight: true
    },
    {
      title: "Resolution Options",
      icon: CheckCircle,
      content: "After verifying your claim, we will either: Issue a full refund, or Replace the product with a new one at no additional cost.",
      highlight: false
    },
    {
      title: "Response Time",
      icon: Clock,
      content: "We aim to respond to all queries within 24 hours during business days (Monday to Saturday, 9 AM to 6 PM).",
      highlight: false
    },
    {
      title: "Verification Process",
      icon: ShieldCheck,
      content: "All claims require verification which may include review of photos/videos and communication with delivery personnel.",
      highlight: false
    }
  ];

  return (
    <PolicyLayout
      title="Return & Refund Policy"
      subtitle="Our policies for returns and refunds"
      icon={RefreshCw}
      gradientFrom="from-red-600"
      gradientTo="to-rose-600"
    >
      <div className="space-y-8">
        <div className="mb-8">
          <p className="text-gray-600 text-xs leading-relaxed">
            Customer satisfaction is our top priority. This policy explains our return and refund procedures for AG's Healthy Foods products.
          </p>
        </div>

        <div className="space-y-6">
          {returnRefundPolicyContent.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl p-3 border transition-colors ${
                  section.highlight
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:border-red-300'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    section.highlight
                      ? 'bg-gradient-to-r from-red-100 to-rose-100'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200'
                  }`}>
                    <SectionIcon size={22} className={section.highlight ? 'text-red-600' : 'text-gray-600'} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${
                      section.highlight ? 'text-red-700' : 'text-gray-900'
                    }`}>
                      {section.title}
                      {section.highlight && <AlertCircle size={20} className="text-red-500" />}
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
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <PhoneCall size={24} className="text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">How to Report Issues</h3>
            </div>
            <p className="text-gray-600 text-xs mb-4">
              To report an issue or request support, please contact us at:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500" />
                <a href="mailto:agshealthyfoods@gmail.com" className="text-red-600 hover:underline text-xs">
                  agshealthyfoods@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall size={18} className="text-gray-500" />
                <a href="tel:+919943311192" className="text-red-600 hover:underline text-xs">
                  +91 99433 11192
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <PackageCheck size={24} className="text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            </div>
            <p className="text-gray-600 text-xs">
              AG's Healthy Foods – Customer Support, No. 40 A Mahalakshmi Nagar South, Palpannaicherry, Nagapattinam – 611001
            </p>
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};

export default ReturnPolicy;