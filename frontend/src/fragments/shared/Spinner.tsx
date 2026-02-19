export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-8 w-8 rounded-full border-2 border-cs-primary/30 border-t-cs-primary animate-spin" />
    </div>
  );
}
