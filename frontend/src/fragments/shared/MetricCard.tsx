import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: boolean;
}

export default function MetricCard({ label, value, icon, accent = false }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`glass-panel rounded-2xl p-5 flex flex-col gap-2 ${
        accent ? 'border-cs-primary/40' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-cs-accent text-xl">{icon}</span>}
        <span className="text-xs font-manrope text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-inter font-bold text-white">{value}</span>
    </motion.div>
  );
}
