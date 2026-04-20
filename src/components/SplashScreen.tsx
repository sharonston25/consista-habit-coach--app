import { motion } from "framer-motion";
import { ConsistaLogo } from "./ConsistaLogo";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "var(--gradient-aurora)" }}
    >
      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ConsistaLogo size={96} animated />
        </motion.div>
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow">
            Consista
          </h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/80">
            Calm. Consistent. Yours.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
