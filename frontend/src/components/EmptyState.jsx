import { PackageX } from 'lucide-react';

const EmptyState = ({ 
  // eslint-disable-next-line no-unused-vars
  icon: Icon = PackageX,
  title = 'Tidak ada data',
  description = 'Belum ada data yang tersedia',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-accent-100 dark:bg-accent-900/50 rounded-full flex items-center justify-center mb-6">
        <Icon size={48} className="text-accent-400 dark:text-accent-600" />
      </div>
      <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-200 mb-2">{title}</h3>
      <p className="text-accent-600 dark:text-accent-400 text-center mb-6 max-w-md">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
