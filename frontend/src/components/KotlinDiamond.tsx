export default function KotlinDiamond({ size = 32, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="kotlinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7F52FF" />
                    <stop offset="50%" stopColor="#C711E1" />
                    <stop offset="100%" stopColor="#E44857" />
                </linearGradient>
            </defs>
            <path
                d="M0 0 L50 50 L0 100 L0 0 Z"
                fill="url(#kotlinGrad)"
            />
            <path
                d="M0 0 L100 0 L50 50 L100 100 L0 100 L50 50 L0 0 Z"
                fill="url(#kotlinGrad)"
            />
        </svg>
    );
}
