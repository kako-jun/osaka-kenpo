import { memo } from 'react';

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureItem = memo(function FeatureItem({
  icon,
  title,
  description,
}: FeatureItemProps) {
  return (
    <>
      <h3 className="text-lg font-bold text-gray-700">
        {icon} {title}
      </h3>
      <p>{description}</p>
    </>
  );
});
