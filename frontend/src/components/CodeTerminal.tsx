import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Copy, Trash2, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TerminalProps {
  code?: string;
  onRun?: (code: string) => void;
  language?: string;
  title?: string;
  height?: string;
}

export const CodeTerminal: React.FC<TerminalProps> = ({ 
  code = '', 
  onRun,
  language = 'python',
  title = 'Terminal',
  height = 'h-64'
}) => {
  const { theme } = useTheme();
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput(['$ Error: No code to run']);
      return;
    }

    setIsRunning(true);
    setOutput([`$ Running ${language} code...`]);

    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock execution output
    const mockOutputs: Record<string, string[]> = {
      python: [
        '$ python script.py',
        'Loading data...',
        'Shape: (1000, 20)',
        'Columns: age, income, credit_score, employment, savings, debt',
        'Data loaded successfully ✓',
        'Processing complete: 0.23s',
        '',
        '>>> Mean Age: 45.2',
        '>>> Mean Income: $65,432',
        '>>> Missing values: 2.1%',
      ],
      dockerfile: [
        '$ docker build -t mlops-model:latest .',
        'Sending build context to Docker daemon',
        'Step 1/8 : FROM python:3.10-slim',
        'Step 2/8 : WORKDIR /app',
        'Step 3/8 : COPY requirements.txt .',
        'Step 4/8 : RUN pip install -r requirements.txt',
        'Successfully built 8c4a5d9e2f1b',
        'Successfully tagged mlops-model:latest',
        'Build complete ✓',
      ],
      default: [
        '$ Executing code...',
        'Code executed successfully ✓',
        'Output: Process completed',
      ]
    };

    const outputs = mockOutputs[language] || mockOutputs.default;
    const delay = 100;
    
    for (let i = 0; i < outputs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      setOutput(prev => [...prev, outputs[i]]);
    }

    setIsRunning(false);
    if (onRun) onRun(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output.join('\n'));
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output.join('\n')));
    element.setAttribute('download', `terminal-output-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const bgClass = theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100';
  const textClass = theme === 'dark' ? 'text-green-400' : 'text-green-700';
  const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-slate-300';

  return (
    <div className={`border ${borderClass} rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} border-b ${borderClass}`}>
        <div className="flex items-center gap-2">
          <Terminal size={16} className={textClass} />
          <span className={`text-sm font-mono ${textClass}`}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning || !code}
            className={`p-1.5 rounded hover:bg-opacity-20 transition-all ${
              isRunning || !code
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark'
                ? 'hover:bg-green-500'
                : 'hover:bg-green-400'
            }`}
            title="Run code"
          >
            <Play size={14} className={textClass} />
          </button>
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded hover:bg-opacity-20 transition-all ${
              theme === 'dark' ? 'hover:bg-blue-500' : 'hover:bg-blue-400'
            }`}
            title="Copy output"
          >
            <Copy size={14} className={textClass} />
          </button>
          <button
            onClick={handleDownload}
            className={`p-1.5 rounded hover:bg-opacity-20 transition-all ${
              theme === 'dark' ? 'hover:bg-purple-500' : 'hover:bg-purple-400'
            }`}
            title="Download output"
          >
            <Download size={14} className={textClass} />
          </button>
          <button
            onClick={() => setOutput([])}
            className={`p-1.5 rounded hover:bg-opacity-20 transition-all ${
              theme === 'dark' ? 'hover:bg-red-500' : 'hover:bg-red-400'
            }`}
            title="Clear output"
          >
            <Trash2 size={14} className={textClass} />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div
        ref={outputRef}
        className={`${height} ${bgClass} overflow-y-auto p-4 font-mono text-sm`}
      >
        {output.length === 0 ? (
          <div className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>
            Click "Run" to execute code
          </div>
        ) : (
          <div className={`space-y-0 ${textClass}`}>
            {output.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-words">
                {line}
              </div>
            ))}
            {isRunning && <div className="inline-block animate-pulse">▌</div>}
          </div>
        )}
      </div>
    </div>
  );
};
