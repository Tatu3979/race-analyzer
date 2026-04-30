import { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import LapTable from './components/LapTable';
import ManualLapForm from './components/ManualLapForm';
import PromptOutput from './components/PromptOutput';
import SegmentChart from './components/SegmentChart';
import SegmentControls from './components/SegmentControls';
import Stage1Form from './components/Stage1Form';
import { stage1Template } from './templates/stage1';
import { stage2Template } from './templates/stage2';
import { stage3Template } from './templates/stage3';
import { fillTemplate } from './templates/fillTemplate';
import { emptyRaceForm, type RaceFormValues } from './templates/types';
import {
  extractAllRecords,
  extractLaps,
  extractRecordsForLap,
  formatDistance,
} from './utils/fit-analyzer';
import {
  emptyManualLap,
  manualLapsToSegments,
  manualLapsTotalDistanceM,
  manualLapsTotalTimerTime,
  type ManualLap,
} from './utils/manual-laps';
import {
  buildStage1Values,
  buildStage2Values,
  computePhaseDistribution,
  computeWeeksUntil,
  derivePeriodMode,
  formatSegmentSize,
} from './utils/race-context';
import {
  splitIntoSegments,
  type SegmentMetrics,
  type SegmentSize,
} from './utils/segment-analyzer';

type InputMode = 'fit' | 'manual';

function pickDefaultSegmentSize(totalDistanceM: number): SegmentSize {
  if (totalDistanceM >= 10000) return 1000;
  if (totalDistanceM >= 3000) return 500;
  return 200;
}

function App() {
  const [inputMode, setInputMode] = useState<InputMode>('fit');
  const [parseResult, setParseResult] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLapIndex, setSelectedLapIndex] = useState<number | null>(null);
  const [segmentSize, setSegmentSize] = useState<SegmentSize>(1000);
  const [raceForm, setRaceForm] = useState<RaceFormValues>(emptyRaceForm);
  const [manualLaps, setManualLaps] = useState<ManualLap[]>([{ ...emptyManualLap }]);

  // FIT mode derived data
  const laps = parseResult ? extractLaps(parseResult) : [];
  const segmentRecords =
    parseResult == null
      ? []
      : selectedLapIndex == null
        ? extractAllRecords(parseResult)
        : extractRecordsForLap(parseResult, selectedLapIndex);
  const fitSegments =
    segmentRecords.length > 0 ? splitIntoSegments(segmentRecords, segmentSize) : [];
  const fitTotalDistanceM =
    segmentRecords.length > 0 ? segmentRecords[segmentRecords.length - 1].distanceM : 0;
  const fitTotalTimerTime =
    segmentRecords.length > 0
      ? (segmentRecords[segmentRecords.length - 1].timestampMs - segmentRecords[0].timestampMs) /
        1000
      : 0;

  // Manual mode derived data
  const manualSegments: SegmentMetrics[] =
    inputMode === 'manual' ? manualLapsToSegments(manualLaps) : [];
  const manualTotalDistanceM = manualLapsTotalDistanceM(manualLaps);
  const manualTotalTimerTime = manualLapsTotalTimerTime(manualLaps);

  // Effective values per mode
  const effectiveSegments = inputMode === 'fit' ? fitSegments : manualSegments;
  const effectiveTotalDistanceM = inputMode === 'fit' ? fitTotalDistanceM : manualTotalDistanceM;
  const effectiveTotalTimerTime = inputMode === 'fit' ? fitTotalTimerTime : manualTotalTimerTime;
  const effectiveSegmentLabel =
    inputMode === 'fit' ? formatSegmentSize(segmentSize) : 'ラップ単位';

  const stage1Values =
    effectiveSegments.length > 0
      ? buildStage1Values({
          raceForm,
          segments: effectiveSegments,
          segmentSizeLabel: effectiveSegmentLabel,
          totalDistanceM: effectiveTotalDistanceM,
          totalTimerTime: effectiveTotalTimerTime,
        })
      : null;
  const stage1Prompt = stage1Values ? fillTemplate(stage1Template, stage1Values) : '';

  const weeksUntilRace = computeWeeksUntil(raceForm.raceDate);
  const periodMode = derivePeriodMode(weeksUntilRace);
  const phases = computePhaseDistribution(weeksUntilRace);

  const stage2Values =
    stage1Values != null ? buildStage2Values(stage1Values, periodMode, phases) : null;
  const stage2Prompt = stage2Values ? fillTemplate(stage2Template, stage2Values) : '';
  const stage3Prompt = stage2Values ? fillTemplate(stage3Template, stage2Values) : '';

  const missingFields: string[] = [];
  if (!raceForm.goalDistance) missingFields.push('主目標距離');
  if (raceForm.goalDistance === 'カスタム' && !raceForm.goalDistanceCustom.trim())
    missingFields.push('カスタム距離');
  if (!raceForm.goalTimeH && !raceForm.goalTimeM && !raceForm.goalTimeS)
    missingFields.push('目標タイム');
  if (!raceForm.raceDate) missingFields.push('レース日');
  if (!raceForm.monthlyMileage) missingFields.push('月間距離');
  if (!raceForm.maxSingleRunDistance) missingFields.push('過去30日最長距離');
  if (effectiveSegments.length === 0) {
    missingFields.push(
      inputMode === 'fit' ? 'FITファイル' : 'ラップデータ（距離 + タイム）',
    );
  }
  const promptsReady = missingFields.length === 0;

  const scopeLabel =
    selectedLapIndex == null
      ? `全体 (${formatDistance(fitTotalDistanceM / 1000)}, ${fitSegments.length} 区間)`
      : `Lap ${selectedLapIndex} (${formatDistance(fitTotalDistanceM / 1000)}, ${fitSegments.length} 区間)`;

  return (
    <main className="app">
      <header className="app-header">
        <img className="app-logo" src="/logo.webp" alt="Race Analyzer" />
        <p className="lede">
          FITファイルまたはラップ手入力から、AI相談用のプロンプトを生成します。
        </p>
      </header>

      <fieldset className="input-mode">
        <legend>データ入力方法</legend>
        <label>
          <input
            type="radio"
            name="input-mode"
            value="fit"
            checked={inputMode === 'fit'}
            onChange={() => setInputMode('fit')}
          />
          FITファイル（Garmin等のPC連携）
        </label>
        <label>
          <input
            type="radio"
            name="input-mode"
            value="manual"
            checked={inputMode === 'manual'}
            onChange={() => setInputMode('manual')}
          />
          ラップ手入力（時計の表示を見ながら入力）
        </label>
      </fieldset>

      {inputMode === 'fit' && (
        <>
          <FileUploader
            onParsed={(result) => {
              setParseResult(result);
              setErrorMessage(null);
              setSelectedLapIndex(null);
              const all = extractAllRecords(result);
              if (all.length > 0) {
                setSegmentSize(pickDefaultSegmentSize(all[all.length - 1].distanceM));
              }
            }}
            onError={(msg) => {
              setErrorMessage(msg);
              setParseResult(null);
              setSelectedLapIndex(null);
            }}
          />

          {errorMessage && <p className="error">{errorMessage}</p>}

          {fitSegments.length > 0 && (
            <section className="analysis">
              <div className="scope-bar">
                <span className="scope-label">範囲: {scopeLabel}</span>
                {selectedLapIndex != null && (
                  <button
                    type="button"
                    className="scope-reset"
                    onClick={() => setSelectedLapIndex(null)}
                  >
                    全体に戻る
                  </button>
                )}
              </div>
              <SegmentControls size={segmentSize} onChange={setSegmentSize} />
              <SegmentChart segments={fitSegments} />
            </section>
          )}
        </>
      )}

      {inputMode === 'manual' && (
        <ManualLapForm laps={manualLaps} onChange={setManualLaps} />
      )}

      <section className="phase4">
        <h2>AI 相談用プロンプト</h2>
        <p className="phase4-recommend">
          Gemini での使用を推奨します。各 Stage を <strong>同じチャット内</strong> で順に投げてください。前ステージの応答は次ステージで自動的に参照されます。
        </p>
        <Stage1Form values={raceForm} onChange={setRaceForm} />
        {promptsReady ? (
          <>
            <PromptOutput stage={1} prompt={stage1Prompt} />
            <PromptOutput stage={2} prompt={stage2Prompt} />
            <PromptOutput stage={3} prompt={stage3Prompt} />
          </>
        ) : (
          <p className="phase4-pending">
            必須項目を入力するとプロンプトが表示されます: {missingFields.join('、')}
          </p>
        )}
      </section>

      {inputMode === 'fit' && parseResult != null && (
        <LapTable
          laps={laps}
          selectedIndex={selectedLapIndex}
          onSelect={setSelectedLapIndex}
        />
      )}
    </main>
  );
}

export default App;
