import { BotMessageSquare } from "lucide-react";

interface TypingIndicatorProps {
  name?: string;
}

const TypingIndicator = ({ name }: TypingIndicatorProps) => {
  return (
    <div className="flex justify-start">
      <div className="flex flex-col rounded-md border border-slate-600 p-2 gap-2 max-w-xs md:max-w-md bg-slate-900">
        <div className="flex items-center gap-2">
          <BotMessageSquare size="14px" />
          <span className="font-semibold text-sm">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
