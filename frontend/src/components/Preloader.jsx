import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for images to load
    const images = document.querySelectorAll("img");
    let loadedImages = 0;
    const totalImages = images.length || 1;

    const imageLoaded = () => {
      loadedImages++;
      if (loadedImages >= totalImages) {
        setTimeout(() => setLoading(false), 500);
      }
    };

    if (totalImages === 1) {
      // If no images, wait minimum time
      setTimeout(() => setLoading(false), 1500);
    } else {
      images.forEach((img) => {
        if (img.complete) {
          imageLoaded();
        } else {
          img.addEventListener("load", imageLoaded);
          img.addEventListener("error", imageLoaded);
        }
      });

      // Maximum wait time
      setTimeout(() => setLoading(false), 3000);
    }

    // Also listen for window load
    window.addEventListener("load", () => {
      setTimeout(() => setLoading(false), 500);
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", imageLoaded);
        img.removeEventListener("error", imageLoaded);
      });
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
        >
          <div className="text-center">
     
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <div className="w-3 h-3 bg-[#6dce00] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-[#6dce00] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-[#6dce00] rounded-full animate-bounce"></div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-gray-600 text-sm"
            >
              Loading...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
