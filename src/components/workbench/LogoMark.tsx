interface Props {
  size?: number;
  className?: string;
}

export default function LogoMark({ size = 24, className = '' }: Props) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}
