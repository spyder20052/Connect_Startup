// Reusable UI Components

export const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false }) => {
    const base = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-theme hover:bg-theme-hover text-white shadow-sm hover:shadow",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white",
        danger: "bg-red-500 hover:bg-red-600 text-white",
        ghost: "text-gray-600 hover:bg-gray-100"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '', noPadding = false, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white border border-gray-200 shadow-sm rounded-lg ${noPadding ? '' : 'p-5'} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
        {children}
    </div>
);

export const Badge = ({ children, color = 'gray', className = '' }) => {
    const colors = {
        theme: 'bg-theme-light text-theme border-theme/20',
        gray: 'bg-gray-100 text-gray-600 border-gray-200',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[color]} ${className}`}>
            {children}
        </span>
    );
};

export const Input = ({ label, error, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Select = ({ label, error, children, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
            {...props}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
    <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className={`${sizes[size]} border-theme border-t-transparent rounded-full animate-spin ${className}`} />
    );
};

export const EmptyState = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-gray-300">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
        {action}
    </div>
);

export const Alert = ({ type = 'info', children, className = '' }) => {
    const types = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800'
    };

    return (
        <div className={`p-4 border rounded-lg ${types[type]} ${className}`}>
            {children}
        </div>
    );
};
