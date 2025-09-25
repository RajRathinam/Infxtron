import React from 'react';

const Faq = () => {
  const faqItems = [
    {
      question: "Who can participate?",
      answer: "Open to UG/PG students from any recognized institution."
    },
    {
      question: "How do I confirm my registration?",
      answer: "You'll receive a confirmation email after submitting the form. Keep your receipt/ID on the event day."
    },
    {
      question: "Is on-spot registration available?",
      answer: "Yes, subject to slot availability for each event."
    },
    {
      question: "What should I bring?",
      answer: "Valid student ID card, laptop (for coding events), and any required software pre-installed."
    }
  ];

  return (
    <section id='faq' className="min-h-screen w-full bg-black relative flex items-center justify-center md:px-4 py-10 overflow-hidden">
      {/* Red Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Content Container */}
      <div className="z-10 w-full max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-red-400  oi-regular mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about INFxTRON'25 symposium registration, participation, and requirements.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-red-300 mb-3 flex items-start">
                <span className="text-red-400 mr-3 text-lg">•</span>
                {item.question}
              </h3>
              <p className="text-gray-200 ml-8 pl-2 border-l-2 border-red-400/50">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="md:mt-12 mt-6 text-center">
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 ring-1 ring-red-400/40 shadow-xl">
            <p className="text-red-300 font-semibold mb-2">
              Still have questions?
            </p>
            <p className="text-gray-200 text-sm">
              Contact us at{" "}<a
  href="mailto:infxtron@egspec.org"
  className="text-red-300 "
>
  infxtron@egspec.org
</a>{" "}
 or reach out to our event coordinators.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;