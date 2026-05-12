import Image from "next/image";

type BrandLogoProps = {
  /** Pixel width/height (square asset) */
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ size = 32, className = "", priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/neuralair-logo.png"
      alt="NeuralAir"
      width={size}
      height={size}
      className={`rounded-lg object-cover ${className}`}
      priority={priority}
    />
  );
}
