import { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import LapTable from './components/LapTable';
import { extractLaps } from './utils/fit-analyzer';

function App() {
  const [parseResult, setParseResult] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const laps = parseResult ? extractLaps(parseResult) : [];

  return (
    <main className="app">
      <header className="app-header">
        <h1>Race Analyzer</h1>
        <p className="lede">
          FITファイルから区間ごとの走行データを分析し、AI相談用のプロンプトを生成します。
        </p>
      </header>

      <FileUploader
        onParsed={(result) => {
          setParseResult(result);
          setErrorMessage(null);
        }}
        onError={(msg) => {
          setErrorMessage(msg);
          setParseResult(null);
        }}
      />

      {errorMessage && <p className="error">{errorMessage}</p>}
      {parseResult != null && (
        <LapTable laps={laps} selectedIndex={null} onSelect={() => {}} />
      )}
    </main>
  );
}

export default App;
