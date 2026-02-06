import Link from 'next/link';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'amazon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
}

interface ButtonAsButtonProps extends BaseButtonProps {
  as?: 'button';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

interface ButtonAsLinkProps extends BaseButtonProps {
  as: 'link';
  href: string;
}

interface ButtonAsExternalLinkProps extends BaseButtonProps {
  as: 'external';
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps | ButtonAsExternalLinkProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#E94E77] hover:bg-opacity-80 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  ghost: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  amazon: 'bg-[#FF9900] hover:bg-opacity-80 text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-2 px-3 text-sm',
  md: 'py-2 px-6',
  lg: 'py-3 px-6',
};

function getButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: Pick<BaseButtonProps, 'variant' | 'size' | 'fullWidth' | 'className'>): string {
  return `${fullWidth ? 'w-full' : 'inline-block'} ${variantStyles[variant]} ${sizeStyles[size]} font-bold rounded-lg transition-colors ${className}`.trim();
}

export function Button(props: ButtonProps) {
  const { as = 'button', children, variant, size, fullWidth, className } = props;
  const buttonClasses = getButtonClasses({ variant, size, fullWidth, className });

  if (as === 'link') {
    const linkProps = props as ButtonAsLinkProps;
    return (
      <Link href={linkProps.href} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  if (as === 'external') {
    const externalProps = props as ButtonAsExternalLinkProps;
    return (
      <a
        href={externalProps.href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
      >
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonAsButtonProps;
  return (
    <button
      type={buttonProps.type || 'button'}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      className={`${buttonClasses} ${buttonProps.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}
