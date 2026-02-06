interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
      <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
        {title}
      </h2>
      <div className="space-y-4 text-gray-800 leading-relaxed">{children}</div>
    </div>
  );
}
