import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';

export default function DownloadCard({
  title,
  description,
  filename,
  size,
  pages,
  category
}) {
  const downloadUrl = `/portfolio_my/downloads/${filename}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 hover:bg-slate-800/60 transition-all group"
    >
      {/* Icon and Category */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
          <FileText size={24} />
        </div>
        {category && (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 rounded-full">
            {category}
          </span>
        )}
      </div>

      {/* Title and Description */}
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        {size && <span>{size}</span>}
        {pages && <span>{pages} pages</span>}
        <span>PDF</span>
      </div>

      {/* Download Button */}
      <a
        href={downloadUrl}
        download
        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-slate-800 hover:bg-blue-500 text-white rounded-lg transition-all group-hover:scale-105"
      >
        <Download size={16} />
        <span className="text-sm font-bold">Download</span>
      </a>
    </motion.div>
  );
}
