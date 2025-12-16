import { BotMessageSquare, UserRound } from "lucide-react";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";

interface MessageBoxProps {
  id: string;
  text: string;
  isAI?: boolean;
  isUser?: boolean;
  sender_nickname: string;
}
const MessageBox = ({
  id,
  text,
  isAI = false,
  isUser = false,
  sender_nickname,
}: MessageBoxProps) => {
  const alignmentClass = useMemo(() => {
    if (isAI) {
      return "justify-start";
    }
    if (isUser) {
      return "justify-end";
    }
    return "justify-start";
  }, [isAI, isUser]);

  const bgColorClass = useMemo(() => {
    if (isAI) {
      return "bg-slate-900";
    }
    if (isUser) {
      return "bg-sky-700";
    }
    return "bg-slate-900";
  }, [isAI, isUser]);

  return (
    <div id={id} className={`flex ${alignmentClass}`}>
      <div
        className={`flex flex-col rounded-md border border-slate-600 p-2 gap-2 max-w-xs md:max-w-md ${bgColorClass}`}
      >
        {isAI ? <AISenderInfo /> : null}
        {!isUser && !isAI ? (
          <SenderInfo sender_nickname={sender_nickname} />
        ) : null}
        <ReactMarkdown>{text}</ReactMarkdown>
        {isAI ? (
          <div className="flex p-2 bg-sky-900 rounded-md">
            <span className="text-xs">
              This answer was created by AI. It tries its best, but it can make
              mistakes.
            </span>
          </div>
        ) : null}
        <div className="flex justify-end">
          <span className="text-sm">10:44</span>
        </div>
      </div>
    </div>
  );
};

const AISenderInfo = () => {
  return (
    <div className="flex items-center gap-2">
      <BotMessageSquare size="14px" />
      <span className="font-semibold text-sm">Lari</span>
    </div>
  );
};

interface SenderInfoProps {
  sender_nickname: string;
}

const SenderInfo = ({ sender_nickname }: SenderInfoProps) => {
  return (
    <div className="flex items-center gap-2">
      <UserRound size="14px" />
      <span className="font-semibold text-sm">{sender_nickname}</span>
    </div>
  );
};

export default MessageBox;
