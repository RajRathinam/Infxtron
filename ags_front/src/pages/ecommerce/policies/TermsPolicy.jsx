import React from "react";
import PolicyLayout from "../PolicyLayout";
import {
  FileText,
  Shield,
  Lock,
  Users,
  MapPin,
  PhoneCall,
  Mail
} from "lucide-react";

const TermsPolicy = () => {
  const termsOfServiceContent = [
    {
      title: "Use of Platform",
      icon: FileText,
      content: "You agree to provide accurate and complete information while registering or using the services. You are responsible for all actions taken through your account."
    },
    {
      title: "Disclaimer",
      icon: Shield,
      content: "We do not guarantee the accuracy, performance, or completeness of any information provided on the Website. Your use of the Platform and Services is entirely at your own risk."
    },
    {
      title: "Intellectual Property",
      icon: Lock,
      content: "All content on the Platform—including text, layout, graphics, and design—is the intellectual property of the Platform Owner. Unauthorized reproduction or use is strictly prohibited."
    },
    {
      title: "Indemnification",
      icon: Users,
      content: "You agree to indemnify and hold harmless the Platform Owner from any claims, liabilities, losses, or damages arising from your breach of these Terms or violation of applicable laws."
    },
    {
      title: "Limitation of Liability",
      icon: Shield,
      content: "The Platform Owner shall not be liable for any indirect, incidental, or consequential damages. Our maximum liability shall not exceed Rs. 100 or the amount paid by you, whichever is lower."
    },
    {
      title: "Jurisdiction",
      icon: MapPin,
      content: "All disputes shall be subject to the exclusive jurisdiction of the courts in Nagapattinam, Tamil Nadu."
    }
  ];

  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Guidelines for using our services"
      icon={FileText}
      gradientFrom="from-amber-600"
      gradientTo="to-orange-600"
    >
      <div className="space-y-8">
        <div className="mb-8">
          <p className="text-gray-600 text-xs leading-relaxed">
            Welcome to AG's Healthy Foods. By accessing and using our website and services, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully.
          </p>
        </div>

        <div className="space-y-6">
          {termsOfServiceContent.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-3 border border-gray-200 hover:border-amber-200 transition-colors"
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <SectionIcon size={22} className="text-amber-600" />
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
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <PhoneCall size={24} className="text-amber-600" />
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            </div>
            <p className="text-gray-600 text-xs mb-4">
              For any concerns regarding these Terms & Conditions, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500" />
                <a href="mailto:agshealthyfoods@gmail.com" className="text-amber-600 hover:underline text-xs">
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

export default TermsPolicy;