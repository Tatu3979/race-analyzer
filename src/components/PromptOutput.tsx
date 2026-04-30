import { useState } from 'react';
import type { StageNumber } from '../templates/types';

type Props = {
  stage: StageNumber;
  prompt: string;
};

const GEMINI_URL = 'https://gemini.google.com/app';

export default function PromptOutput({ stage, prompt }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  }

  async function handleOpenInGemini() {
    await handleCopy();
    window.open(GEMINI_URL, '_blank', 'noopener,noreferrer');
  }

  return (
    <section className="prompt-output">
      <h3>Stage {stage} プロンプト</h3>
      <pre className="prompt-output-body">
        <code>{prompt}</code>
      </pre>
      <div className="prompt-output-actions">
        <button type="button" onClick={handleCopy}>
          {copied ? 'コピーしました' : 'コピー'}
        </button>
        <button type="button" onClick={handleOpenInGemini}>
          Geminiで開く
        </button>
      </div>
      <p className="prompt-output-hint">
        Gemini を新しいタブで開きます。コピー済のプロンプトを貼り付けてご利用ください。
      </p>
    </section>
  );
}
