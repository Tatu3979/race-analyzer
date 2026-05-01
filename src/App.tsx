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
type StepNumber = 1 | 2 | 3 | 4;

function pickDefaultSegmentSize(totalDistanceM: number): SegmentSize {
  if (totalDistanceM >= 10000) return 1000;
  if (totalDistanceM >= 3000) return 500;
  return 200;
}

function App() {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [inputMode, setInputMode] = useState<InputMode | null>(null);
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

  // Per-step validity
  const step1Valid = inputMode != null;
  const step2Valid =
    inputMode === 'fit'
      ? errorMessage == null && fitSegments.length > 0
      : inputMode === 'manual'
        ? manualSegments.length > 0
        : false;
  const raceFormMissing: string[] = [];
  if (!raceForm.goalDistance) raceFormMissing.push('主目標距離');
  if (raceForm.goalDistance === 'カスタム' && !raceForm.goalDistanceCustom.trim())
    raceFormMissing.push('カスタム距離');
  if (!raceForm.goalTimeH && !raceForm.goalTimeM && !raceForm.goalTimeS)
    raceFormMissing.push('目標タイム');
  if (!raceForm.raceDate) raceFormMissing.push('レース日');
  if (!raceForm.monthlyMileage) raceFormMissing.push('月間距離');
  if (!raceForm.maxSingleRunDistance) raceFormMissing.push('過去30日最長距離');
  const step3Valid = raceFormMissing.length === 0;

  const scopeLabel =
    selectedLapIndex == null
      ? `全体 (${formatDistance(fitTotalDistanceM / 1000)}, ${fitSegments.length} 区間)`
      : `Lap ${selectedLapIndex} (${formatDistance(fitTotalDistanceM / 1000)}, ${fitSegments.length} 区間)`;

  function goNext() {
    if (currentStep === 1 && step1Valid) setCurrentStep(2);
    else if (currentStep === 2 && step2Valid) setCurrentStep(3);
    else if (currentStep === 3 && step3Valid) setCurrentStep(4);
  }
  function goBack() {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as StepNumber);
  }

  return (
    <main className="app">
      <header className="app-header">
        <img className="app-logo" src="/logo.webp" alt="Race Analyzer" />
        <p className="step-indicator">Step {currentStep} / 4</p>
      </header>

      {currentStep > 1 && (
        <button type="button" className="step-back" onClick={goBack}>
          ← 戻る
        </button>
      )}

      {currentStep === 1 && (
        <section className="step step-1">
          <p className="step-1-lede">
            本命レースで目標を達成しよう。
            <br />
            レースデータをアップロードするだけで、AI相談用のプロンプトを生成します。
          </p>
          <h2 className="step-title">まずは入力方法を選んでください</h2>
          <p className="step-1-helper">FITファイルをお持ちでない方は手動入力もできます</p>
          <div className="mode-buttons">
            <button
              type="button"
              className={`mode-button${inputMode === 'fit' ? ' is-selected' : ''}`}
              onClick={() => setInputMode('fit')}
            >
              <span className="mode-button-title">FIT ファイル</span>
              <span className="mode-button-desc">Garmin等のレースデータをアップロード</span>
            </button>
            <button
              type="button"
              className={`mode-button${inputMode === 'manual' ? ' is-selected' : ''}`}
              onClick={() => setInputMode('manual')}
            >
              <span className="mode-button-title">ラップ手入力</span>
              <span className="mode-button-desc">ラップタイムを直接入力</span>
            </button>
          </div>
        </section>
      )}

      {currentStep === 2 && inputMode === 'fit' && (
        <section className="step step-2">
          <h2 className="step-title">FIT ファイルをアップロード</h2>
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
            <>
              <div className="analysis">
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
              </div>
              {parseResult != null && (
                <LapTable
                  laps={laps}
                  selectedIndex={selectedLapIndex}
                  onSelect={setSelectedLapIndex}
                />
              )}
            </>
          )}
        </section>
      )}

      {currentStep === 2 && inputMode === 'manual' && (
        <section className="step step-2">
          <h2 className="step-title">ラップを入力</h2>
          <ManualLapForm laps={manualLaps} onChange={setManualLaps} />
        </section>
      )}

      {currentStep === 3 && (
        <section className="step step-3">
          <h2 className="step-title">AI 相談用の情報を入力</h2>
          <Stage1Form values={raceForm} onChange={setRaceForm} />
          {!step3Valid && (
            <p className="step-pending">
              不足項目: {raceFormMissing.join('、')}
            </p>
          )}
        </section>
      )}

      {currentStep === 4 && (
        <section className="step step-4">
          <h2 className="step-title">AI 相談用プロンプト</h2>
          <p className="step-recommend">
            Gemini での使用を推奨します。各 Stage を <strong>同じチャット内</strong> で順に投げてください。前ステージの応答は次ステージで自動的に参照されます。
          </p>
          <PromptOutput stage={1} prompt={stage1Prompt} />
          <PromptOutput stage={2} prompt={stage2Prompt} />
          <PromptOutput stage={3} prompt={stage3Prompt} />
        </section>
      )}

      {currentStep < 4 && (
        <div className="step-cta">
          <button
            type="button"
            className="step-next"
            onClick={goNext}
            disabled={
              (currentStep === 1 && !step1Valid) ||
              (currentStep === 2 && !step2Valid) ||
              (currentStep === 3 && !step3Valid)
            }
          >
            次へ →
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
