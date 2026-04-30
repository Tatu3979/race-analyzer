import { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import LapTable from './components/LapTable';
import SegmentChart from './components/SegmentChart';
import SegmentControls from './components/SegmentControls';
import { extractLaps, extractRecordsForLap } from './utils/fit-analyzer';
import { splitIntoSegments, type SegmentSize } from './utils/segment-analyzer';

function App() {
  const [parseResult, setParseResult] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLapIndex, setSelectedLapIndex] = useState<number | null>(null);
  const [segmentSize, setSegmentSize] = useState<SegmentSize>(1000);

  const laps = parseResult ? extractLaps(parseResult) : [];
  const segmentRecords =
    parseResult != null && selectedLapIndex != null
      ? extractRecordsForLap(parseResult, selectedLapIndex)
      : [];
  const segments =
    segmentRecords.length > 0 ? splitIntoSegments(segmentRecords, segmentSize) : [];

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
          setSelectedLapIndex(null);
        }}
        onError={(msg) => {
          setErrorMessage(msg);
          setParseResult(null);
          setSelectedLapIndex(null);
        }}
      />

      {errorMessage && <p className="error">{errorMessage}</p>}
      {parseResult != null && (
        <LapTable
          laps={laps}
          selectedIndex={selectedLapIndex}
          onSelect={setSelectedLapIndex}
        />
      )}

      {segments.length > 0 && (
        <>
          <SegmentControls size={segmentSize} onChange={setSegmentSize} />
          <SegmentChart segments={segments} />
        </>
      )}
    </main>
  );
}

export default App;
