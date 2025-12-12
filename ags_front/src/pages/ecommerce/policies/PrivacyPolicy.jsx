import React from "react";
import PolicyLayout from "../PolicyLayout";
import {
  Shield,
  FileText,
  Share2,
  Users,
  Lock,
  ShieldCheck,
  PhoneCall,
  Mail
} from "lucide-react";

const PrivacyPolicy = () => {
  const privacyPolicyContent = [
    {
      title: "Information We Collect",
      icon: FileText,
      content: "We may collect the following types of information: Personal details such as name, address, email ID, and phone number. Order-related information including delivery address and payment details. Device information, IP address, browser type, and cookies."
    },
    {
      title: "How We Use Your Information",
      icon: Share2,
      content: "To process and deliver your orders. To improve our products, services, and website. To send order notifications, updates, or promotional messages (only if opted-in). To prevent fraudulent activity and enhance security."
    },
    {
      title: "Sharing of Information",
      icon: Users,
      content: "We do not sell your personal information. We may share information only with: Delivery partners to fulfill your orders. Payment gateways to process transactions securely. Law enforcement agencies, if required by law."
    },
    {
      title: "Cookies",
      icon: Shield,
      content: "We use cookies to enhance user experience, analyze website traffic, and improve our services. You may disable cookies in your browser settings, but certain features may not work properly."
    },
    {
      title: "Data Security",
      icon: Lock,
      content: "We use industry-standard security measures to protect your data against unauthorized access, modification, or disclosure. However, no online transmission is 100% secure."
    },
    {
      title: "Your Rights",
      icon: ShieldCheck,
      content: "Right to access your stored information. Right to request correction or deletion. Right to withdraw consent for marketing communications."
    },
    {
      title: "Third-Party Links",
      icon: Share2,
      content: "Our Platform may contain links to third-party websites. We are not responsible for their privacy practices."
    },
    {
      title: "Updates to This Policy",
      icon: FileText,
      content: "We may update this Privacy Policy periodically. Continued use of the Platform after updates indicates acceptance of the revised policy."
    }
  ];

  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How we protect and use your information"
      icon={Shield}
      gradientFrom="from-emerald-600"
      gradientTo="to-teal-600"
    >
      <div className="space-y-8">
        <div className="mb-8">
          <p className="text-gray-600 text-xs leading-relaxed">
            At AG's Healthy Foods, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>
        </div>

        <div className="space-y-6">
          {privacyPolicyContent.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-3 border border-gray-200 hover:border-emerald-200 transition-colors"
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                    <SectionIcon size={22} className="text-emerald-600" />
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
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <PhoneCall size={24} className="text-emerald-600" />
              <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
            </div>
            <p className="text-gray-600 text-xs mb-4">
              For any questions or concerns about our Privacy Policy, please contact us at:
            </p>
            <div className="space-y-3">
              <div className="flex items-center  gap-3">
                <Mail size={18} className="text-gray-500" />
                <a href="mailto:agshealthyfoods@gmail.com" className="text-emerald-600 hover:underline">
                  agshealthyfoods@gmail.com
                </a>
              </div>
              <p className="text-gray-600 text-xs ml-7">
                Ag's Healthy Foods, No. 40 A Mahalakshmi Nagar South, Palpannaicherry, Nagapattinam - 611001
              </p>
            </div>
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};

export default PrivacyPolicy;