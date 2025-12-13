// components/DietPlanForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Ruler,
  Scale,
  Target,
  Mail,
  Phone,
  Target as TargetIcon,
  Apple,
  AlertTriangle,
  MessageSquare,
  Stethoscope,
  FileText,
  ChevronRight,
  ChevronLeft,
  Info,
  Lock,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';

const DietPlanForm = ({ onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    email: '',
    phone: '',
    mainGoal: '',
    dietType: '',
    foodRestrictions: '',
    dislikedFoods: '',
    preferredContact: 'WhatsApp',
    followUpConsultation: 'no',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [sectionValidations, setSectionValidations] = useState({
    personal: false,
    contact: false,
    goals: false
  });
 const [isMobile, setIsMobile] = useState(false); // ADD THIS LINE
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // VALIDATION FUNCTIONS
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateAge = (age) => {
    const num = parseInt(age);
    return !isNaN(num) && num >= 1 && num <= 120 && age.length <= 2;
  };

  const validateHeight = (height) => {
    const num = parseFloat(height);
    return !isNaN(num) && num >= 50 && num <= 272;
  };

  const validateWeight = (weight) => {
    const num = parseFloat(weight);
    return !isNaN(num) && num >= 1 && num <= 635;
  };

  const validateTargetWeight = (targetWeight) => {
    if (!targetWeight) return true; // Optional
    const num = parseFloat(targetWeight);
    return !isNaN(num) && num >= 1 && num <= 635;
  };

  // SECTION VALIDATION
  const validatePersonalSection = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (!validateAge(formData.age)) newErrors.age = 'Age must be 1-120 (max 2 digits)';
    
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    if (!formData.height) newErrors.height = 'Height is required';
    else if (!validateHeight(formData.height)) newErrors.height = 'Height must be 50-272 cm';
    
    if (!formData.weight) newErrors.weight = 'Weight is required';
    else if (!validateWeight(formData.weight)) newErrors.weight = 'Weight must be 1-635 kg';
    
    if (formData.targetWeight && !validateTargetWeight(formData.targetWeight)) {
      newErrors.targetWeight = 'Target weight must be 1-635 kg';
    }
    
    return newErrors;
  };

  const validateContactSection = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Enter 10-digit phone number';
    
    return newErrors;
  };

  const validateGoalsSection = () => {
    const newErrors = {};
    
    if (!formData.mainGoal) newErrors.mainGoal = 'Main goal is required';
    if (!formData.dietType) newErrors.dietType = 'Diet type is required';
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Update section validation status
    setTimeout(() => {
      updateSectionValidation();
    }, 100);
  };

  const updateSectionValidation = () => {
    let personalValid = false;
    let contactValid = false;
    let goalsValid = false;
    
    switch (activeSection) {
      case 'personal':
        personalValid = Object.keys(validatePersonalSection()).length === 0;
        break;
      case 'contact':
        contactValid = Object.keys(validateContactSection()).length === 0;
        break;
      case 'goals':
        goalsValid = Object.keys(validateGoalsSection()).length === 0;
        break;
    }
    
    setSectionValidations({
      personal: personalValid,
      contact: contactValid,
      goals: goalsValid
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all sections
    const personalErrors = validatePersonalSection();
    const contactErrors = validateContactSection();
    const goalsErrors = validateGoalsSection();
    
    const allErrors = { ...personalErrors, ...contactErrors, ...goalsErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      
      // Find first section with error
      let firstErrorSection = 'personal';
      if (Object.keys(personalErrors).length > 0) firstErrorSection = 'personal';
      else if (Object.keys(contactErrors).length > 0) firstErrorSection = 'contact';
      else if (Object.keys(goalsErrors).length > 0) firstErrorSection = 'goals';
      
      setActiveSection(firstErrorSection);
      
      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = Object.keys(allErrors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
      
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/diet-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        
        Swal.fire({
          title: 'Successfully Submitted!',
          html: `
            <div class="text-center">
              <h3 class="text-xl font-bold text-gray-900 mb-2">Diet Plan Request Submitted</h3>
              <p class="text-gray-600 text-xs">
                Our nutrition experts will review your details and contact you within 24 hours.
              </p>
              <div class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p class="font-medium">Contact: ${formData.phone}</p>
                <p class="font-medium">Email: ${formData.email}</p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Got it!',
        }).then(() => {
          if (onSubmitSuccess) onSubmitSuccess();
          onClose();
        });
      } else {
        throw new Error(data.message || 'Failed to submit form.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        title: 'Submission Failed',
        text: error.message || 'Unable to submit your request.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formSections = [
    { id: 'personal', title: 'Personal', icon: User, validate: validatePersonalSection },
    { id: 'contact', title: 'Contact', icon: Mail, validate: validateContactSection },
    { id: 'goals', title: 'Goals', icon: TargetIcon, validate: validateGoalsSection },
    { id: 'notes', title: 'Additional', icon: FileText }
  ];

  const nextSection = () => {
    const currentIndex = formSections.findIndex(s => s.id === activeSection);
    
    if (currentIndex < formSections.length - 1) {
      // Validate current section before proceeding
      const currentSection = formSections[currentIndex];
      if (currentSection.validate) {
        const sectionErrors = currentSection.validate();
        if (Object.keys(sectionErrors).length > 0) {
          setErrors(sectionErrors);
          
          // Find first error and focus
          const firstErrorField = Object.keys(sectionErrors)[0];
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          
          return;
        }
      }
      
      setActiveSection(formSections[currentIndex + 1].id);
    }
  };

  const prevSection = () => {
    const currentIndex = formSections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(formSections[currentIndex - 1].id);
    }
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-emerald-100"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Perfect! Request Submitted</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Our nutrition experts will analyze your profile and contact you within 24 hours.
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 w-full text-sm"
          >
            Close & Continue Browsing
          </button>
        </motion.div>
      </div>
    );
  }

  const renderPersonalSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
                errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.fullName && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.fullName}</span>
            </div>
          )}
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Age (years) *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
                errors.age ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
              placeholder="e.g., 25"
              min="1"
              max="120"
              maxLength="2"
            />
          </div>
          {errors.age && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.age}</span>
            </div>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Gender *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Male', 'Female', 'Other'].map((option) => (
              <label key={option} className="relative">
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={formData.gender === option}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className={`w-full py-2.5 text-xs text-center border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.gender === option
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:border-emerald-400 hover:bg-gray-50'
                }`}>
                  {option}
                </div>
              </label>
            ))}
          </div>
          {errors.gender && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.gender}</span>
            </div>
          )}
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Height (cm) *
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
                errors.height ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
              placeholder="e.g., 170"
              min="50"
              max="272"
              step="0.1"
            />
          </div>
          {errors.height && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.height}</span>
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Current Weight (kg) *
          </label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
                errors.weight ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
              placeholder="e.g., 70"
              min="1"
              max="635"
              step="0.1"
            />
          </div>
          {errors.weight && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.weight}</span>
            </div>
          )}
        </div>

        {/* Target Weight */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Target Weight (kg) - Optional
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              name="targetWeight"
              value={formData.targetWeight}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400 transition-all duration-200"
              placeholder="e.g., 65"
              min="1"
              max="635"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
                errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
              placeholder="e.g., 9876543210"
              maxLength="10"
              pattern="[0-9]{10}"
            />
          </div>
          {errors.phone && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        {/* Preferred Contact */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Preferred Contact Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['WhatsApp', 'Email', 'Both'].map((option) => (
              <label key={option} className="relative">
                <input
                  type="radio"
                  name="preferredContact"
                  value={option}
                  checked={formData.preferredContact === option}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className={`w-full py-2.5 text-xs text-center border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.preferredContact === option
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:border-emerald-400 hover:bg-gray-50'
                }`}>
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoalsSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Goal */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Main Goal *
          </label>
          <div className="relative">
            <TargetIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <select
              name="mainGoal"
              value={formData.mainGoal}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 appearance-none bg-white ${
                errors.mainGoal ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
              }`}
            >
              <option value="" className="text-gray-500">Select Your Main Goal</option>
              <option value="Lose weight (fat loss)">Lose weight (fat loss)</option>
              <option value="Gain weight (muscle gain)">Gain weight (muscle gain)</option>
              <option value="Maintain current weight">Maintain current weight</option>
              <option value="Improve strength/performance">Improve strength/performance</option>
              <option value="General healthy lifestyle">General healthy lifestyle</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90" />
          </div>
          {errors.mainGoal && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.mainGoal}</span>
            </div>
          )}
        </div>

        {/* Diet Type */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Diet Type *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Vegetarian', 'Non-Vegetarian', 'Eggetarian'].map((option) => (
              <label key={option} className="relative">
                <input
                  type="radio"
                  name="dietType"
                  value={option}
                  checked={formData.dietType === option}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className={`w-full py-2.5 text-xs text-center border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.dietType === option
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:border-emerald-400 hover:bg-gray-50'
                }`}>
                  {option}
                </div>
              </label>
            ))}
          </div>
          {errors.dietType && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{errors.dietType}</span>
            </div>
          )}
        </div>

        {/* Food Restrictions */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800">
            Food Restrictions / Allergies
          </label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              name="foodRestrictions"
              value={formData.foodRestrictions}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400 transition-all duration-200"
              placeholder="e.g., Lactose intolerant, Gluten allergy, Nut allergy, etc."
              rows="3"
            />
          </div>
        </div>

        {/* Disliked Foods */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800">
            Disliked Foods
          </label>
          <textarea
            name="dislikedFoods"
            value={formData.dislikedFoods}
            onChange={handleChange}
            className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400 transition-all duration-200"
            placeholder="Foods you don't like to eat"
            rows="3"
          />
        </div>

        {/* Follow-up Consultation */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Follow-up Consultation?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['yes', 'no'].map((option) => (
              <label key={option} className="relative">
                <input
                  type="radio"
                  name="followUpConsultation"
                  value={option}
                  checked={formData.followUpConsultation === option}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className={`w-full py-2.5 text-xs text-center border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.followUpConsultation === option
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:border-emerald-400 hover:bg-gray-50'
                }`}>
                  {option === 'yes' ? 'Yes, please' : 'No, thanks'}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Additional Notes / Special Requirements
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-emerald-400 transition-all duration-200"
            placeholder="Any other information that would help us create a better diet plan for you..."
            rows="5"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Summary of Your Request
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-700">{formData.age || '--'}</div>
            <div className="text-xs text-gray-600">Age</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-700">{formData.height || '--'}cm</div>
            <div className="text-xs text-gray-600">Height</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-700">{formData.weight || '--'}kg</div>
            <div className="text-xs text-gray-600">Weight</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-700">{formData.gender || '--'}</div>
            <div className="text-xs text-gray-600">Gender</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-0 overflow-y-auto backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gradient-to-b from-white to-gray-50 shadow-2xl w-full h-full md:max-w-5xl md:my-8 md:rounded-2xl md:border md:border-gray-200 md:h-auto md:max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-4 md:px-8 md:py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg md:text-2xl font-bold mb-1">Customized Diet Plan</h3>
              <p className="text-emerald-100 text-xs md:text-sm">
                Get a personalized meal plan designed just for you
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            {formSections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  <span className="text-[10px] mt-1 font-medium">{section.title}</span>
                </button>
                {index < formSections.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1 md:mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 md:p-6 lg:p-8 h-[calc(100vh-200px)] md:max-h-[calc(90vh-180px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {activeSection === 'personal' && renderPersonalSection()}
            {activeSection === 'contact' && renderContactSection()}
            {activeSection === 'goals' && renderGoalsSection()}
            {activeSection === 'notes' && renderNotesSection()}

            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={prevSection}
                disabled={activeSection === 'personal'}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {activeSection !== 'notes' ? (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    Continue to {formSections[formSections.findIndex(s => s.id === activeSection) + 1]?.title || 'Next'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Form Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Your data is secure and confidential</span>
              </div>
              <div className="text-xs text-gray-500">
                * Required fields
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DietPlanForm;