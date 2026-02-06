import { Button } from '@/components/Button';

interface SponsorSectionProps {
  description: string;
  buttonText: string;
  buttonUrl: string;
  variant: 'primary' | 'amazon';
  note?: string;
}

export function SponsorSection({
  description,
  buttonText,
  buttonUrl,
  variant,
  note,
}: SponsorSectionProps) {
  const bgColor = variant === 'primary' ? 'bg-[#FFF4F4]' : 'bg-[#FFF8DC]';

  return (
    <div className={`mt-4 p-4 ${bgColor} rounded-lg text-center`}>
      <p className="text-sm mb-3" dangerouslySetInnerHTML={{ __html: description }} />
      <Button as="external" href={buttonUrl} variant={variant}>
        {buttonText}
      </Button>
      {note && (
        <p className="text-xs mt-2 text-gray-600" dangerouslySetInnerHTML={{ __html: note }} />
      )}
    </div>
  );
}
