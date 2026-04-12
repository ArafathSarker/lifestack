import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 36, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-indigo-500/20"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="LifeStack"
          width={size}
          height={size}
          className="object-cover"
          priority
        />
      </div>
      {showText && (
        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          LifeStack
        </span>
      )}
    </div>
  );
}
