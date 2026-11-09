import type { ComponentProps } from 'react'

const variantClasses = {
  primary: 'bg-sidebar px-4 py-3 text-on-sidebar hover:bg-focus focus-visible:outline-focus',
  text: 'text-sidebar underline-offset-4 hover:underline focus-visible:outline-focus',
  inverse: 'border border-on-sidebar/40 px-3 py-2 text-on-sidebar hover:bg-on-sidebar/10 focus-visible:outline-on-sidebar',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variantClasses
}

export function Button({ variant = 'primary', type = 'button', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
    />
  )
}
