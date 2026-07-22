import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Activity, Bot, Send, Terminal, X } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { processEngineerCommand } from '../../services/agentEngine';
import { ToolCallAction, ToolExecutionResult } from '../../types/agentTools';

interface AIChatDrawerProps {
  activeView: string;
  setActiveView: (viewId: string) => void;
}

type ChatRole = 'operator' | 'sentinel';

interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
  actionTaken?: ToolExecutionResult['actionTaken'];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 0,
  role: 'sentinel',
  content: [
    '**SENTINEL AI // ONLINE**',
    'Acknowledged. I have live telemetry awareness across all **six GreenPulse operational views**.',
    'Issue a status query, route to an operational panel, or execute an authorized **override** or **load-shed** command.',
  ].join('\n'),
};

const renderInlineMarkdown = (text: string) => text
  .split(/(\*\*[^*]+\*\*)/g)
  .map((segment, index) => {
    const isBold = segment.startsWith('**') && segment.endsWith('**');

    return isBold
      ? <strong key={index} className="font-extrabold text-emerald-200">{segment.slice(2, -2)}</strong>
      : <React.Fragment key={index}>{segment}</React.Fragment>;
  });

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="space-y-1 leading-relaxed">
    {content.split('\n').map((line, index) => (
      <p key={`${line}-${index}`} className="min-h-[1rem]">
        {renderInlineMarkdown(line)}
      </p>
    ))}
  </div>
);

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ activeView, setActiveView }) => {
  const telemetry = useTelemetry();
  const {
    emergencyOverrideActive,
    toggleEmergencyOverride,
    activateLoadShedding,
  } = telemetry;
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const commandIdRef = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen]);

  const executeAction = (action: NonNullable<ToolExecutionResult['actionTaken']>) => {
    switch (action.type) {
      case 'NAVIGATE':
        setActiveView(action.payload.viewId);
        break;
      case 'OVERRIDE':
        if (!emergencyOverrideActive) {
          toggleEmergencyOverride();
        }
        break;
      case 'LOAD_SHED':
        activateLoadShedding();
        break;
      default:
        break;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = command.trim();

    if (!input) return;

    const result = processEngineerCommand(input, telemetry);
    const operatorMessage: ChatMessage = {
      id: commandIdRef.current++,
      role: 'operator',
      content: input,
    };
    const sentinelMessage: ChatMessage = {
      id: commandIdRef.current++,
      role: 'sentinel',
      content: result.message,
      actionTaken: result.actionTaken,
    };

    setMessages(current => [...current, operatorMessage, sentinelMessage]);
    setCommand('');

    if (result.actionTaken) {
      executeAction(result.actionTaken);
    }
  };

  const activeViewLabel = activeView.replace(/-/g, ' ').toUpperCase();

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 border border-[#10b981] bg-[#090d16] px-4 py-3 font-mono text-xs font-bold tracking-wider text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.35)] transition hover:bg-emerald-950/50 hover:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        aria-label="Open Sentinel AI Agent"
      >
        <Bot className="h-4 w-4" aria-hidden="true" />
        <span>🤖 SENTINEL AI AGENT</span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section
      className="fixed bottom-5 right-5 z-[60] flex h-[32rem] w-[min(26rem,calc(100vw-2.5rem))] flex-col overflow-hidden border border-[#10b981] bg-[#090d16] font-mono text-xs text-slate-100 shadow-[0_0_32px_rgba(16,185,129,0.28)]"
      role="dialog"
      aria-label="Sentinel AI Agent command console"
    >
      <header className="flex items-center justify-between border-b border-emerald-500/50 bg-emerald-950/25 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-emerald-400 bg-emerald-500/10 text-emerald-300">
            <Bot className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-extrabold tracking-[0.16em] text-emerald-200">SENTINEL AI</h2>
            <p className="truncate text-[10px] tracking-wider text-emerald-500">CORE COMMAND INTERFACE // VIEW: {activeViewLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 text-slate-400 transition hover:bg-emerald-500/15 hover:text-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-300"
          aria-label="Close Sentinel AI Agent"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div className="flex items-center justify-between border-b border-emerald-500/20 bg-black/20 px-4 py-2 text-[10px] tracking-wide">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Activity className="h-3 w-3 animate-pulse" aria-hidden="true" />
          LIVE TELEMETRY LINK
        </span>
        <span className="text-slate-500">CLEARANCE: L4</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map(message => (
          <article
            key={message.id}
            className={`max-w-[93%] border px-3 py-2.5 ${
              message.role === 'sentinel'
                ? 'border-emerald-500/35 bg-emerald-950/20 text-emerald-50'
                : 'ml-auto border-slate-700 bg-slate-900/80 text-slate-200'
            }`}
          >
            <div className={`mb-1.5 flex items-center gap-1.5 text-[9px] font-bold tracking-[0.14em] ${
              message.role === 'sentinel' ? 'text-emerald-500' : 'text-slate-500'
            }`}>
              {message.role === 'sentinel' ? <Bot className="h-3 w-3" aria-hidden="true" /> : <Terminal className="h-3 w-3" aria-hidden="true" />}
              {message.role === 'sentinel' ? 'SENTINEL' : 'OPERATOR'}
              {message.actionTaken && (
                <span className="ml-auto border border-emerald-500/30 px-1 py-0.5 text-[8px] text-emerald-300">
                  TOOL: {message.actionTaken.type as ToolCallAction}
                </span>
              )}
            </div>
            <MarkdownMessage content={message.content} />
          </article>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-emerald-500/45 bg-black/25 p-3">
        <label htmlFor="sentinel-command" className="mb-1.5 block text-[9px] font-bold tracking-[0.16em] text-emerald-500">
          TERMINAL COMMAND
        </label>
        <div className="flex gap-2">
          <input
            id="sentinel-command"
            value={command}
            onChange={event => setCommand(event.target.value)}
            placeholder="Query telemetry or issue a command..."
            className="min-w-0 flex-1 border border-emerald-500/40 bg-[#060910] px-3 py-2 text-xs text-emerald-50 placeholder:text-slate-600 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-300"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!command.trim()}
            className="flex items-center gap-1 border border-emerald-400 bg-emerald-500 px-3 py-2 text-[10px] font-extrabold tracking-wider text-[#06251c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:border-emerald-900 disabled:bg-emerald-950 disabled:text-emerald-800"
          >
            <Send className="h-3 w-3" aria-hidden="true" />
            RUN
          </button>
        </div>
      </form>
    </section>
  );
};

export default AIChatDrawer;
