import { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import LapTable from './components/LapTable';
import PromptOutput from './components/PromptOutput';
import SegmentChart from './components/SegmentChart';
import SegmentControls from './components/SegmentControls';
import Stage1Form from './components/Stage1Form';
import Stage2Bridge from './components/Stage2Bridge';
import StageNavigator from './components/StageNavigator';
import { stage1Template } from './templates/stage1';
import { stage2Template } from './templates/stage2';
import { stage3Template } from './templates/stage3';
import { fillTemplate } from './templates/fillTemplate';
import {
  emptyRaceForm,
  emptyStage1to2,
  type RaceFormValues,
  type Stage1to2Values,
  type StageNumber,
} from './templates/types';
import {
  extractAllRecords,
  extractLaps,
  extractRecordsForLap,
  formatDistance,
} from './utils/fit-analyzer';
import {
  buildStage1Values,
  buildStage2Values,
  computeWeeksUntil,
  derivePeriodMode,
} from './utils/race-context';
import { splitIntoSegments, type SegmentSize } from './utils/segment-analyzer';

function pickDefaultSegmentSize(totalDistanceM: number): SegmentSize {
  if (totalDistanceM >= 10000) return 1000;
  if (totalDistanceM >= 3000) return 500;
  return 200;
}

function App() {
  const [parseResult, setParseResult] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLapIndex, setSelectedLapIndex] = useState<number | null>(null);
  const [segmentSize, setSegmentSize] = useState<SegmentSize>(1000);
  const [raceForm, setRaceForm] = useState<RaceFormValues>(emptyRaceForm);
  const [stage1to2, setStage1to2] = useState<Stage1to2Values>(emptyStage1to2);
  const [currentStage, setCurrentStage] = useState<StageNumber>(1);

  const laps = parseResult ? extractLaps(parseResult) : [];

  const segmentRecords =
    parseResult == null
      ? []
      : selectedLapIndex == null
        ? extractAllRecords(parseResult)
        : extractRecordsForLap(parseResult, selectedLapIndex);

  const segments =
    segmentRecords.length > 0 ? splitIntoSegments(segmentRecords, segmentSize) : [];

  const totalDistanceM =
    segmentRecords.length > 0 ? segmentRecords[segmentRecords.length - 1].distanceM : 0;

  const totalTimerTime =
    segmentRecords.length > 0
      ? (segmentRecords[segmentRecords.length - 1].timestampMs - segmentRecords[0].timestampMs) /
        1000
      : 0;

  const stage1Values =
    segments.length > 0
      ? buildStage1Values({
          raceForm,
          segments,
          segmentSize,
          totalDistanceM,
          totalTimerTime,
        })
      : null;
  const stage1Prompt = stage1Values ? fillTemplate(stage1Template, stage1Values) : '';

  const weeksUntilRace = computeWeeksUntil(raceForm.raceDate);
  const periodMode = derivePeriodMode(weeksUntilRace);

  const stage2Values =
    stage1Values != null ? buildStage2Values(stage1Values, stage1to2, periodMode) : null;
  const stage2Prompt = stage2Values ? fillTemplate(stage2Template, stage2Values) : '';
  const stage3Prompt = stage2Values ? fillTemplate(stage3Template, stage2Values) : '';

  const stage1MissingFields: string[] = [];
  if (!raceForm.goalDistance) stage1MissingFields.push('主目標距離');
  if (raceForm.goalDistance === 'カスタム' && !raceForm.goalDistanceCustom.trim())
    stage1MissingFields.push('カスタム距離');
  if (!raceForm.goalTime) stage1MissingFields.push('目標タイム');
  if (!raceForm.raceDate) stage1MissingFields.push('レース日');
  if (!raceForm.monthlyMileage) stage1MissingFields.push('月間距離');
  if (!raceForm.maxSingleRunDistance) stage1MissingFields.push('過去30日最長距離');

  const stage2MissingFields: string[] = [];
  if (!stage1to2.strengthCategory) stage2MissingFields.push('得意分野');
  if (!stage1to2.weaknessCategory) stage2MissingFields.push('重点弱点');
  if (!stage1to2.currentPhase) stage2MissingFields.push('現在のフェーズ');
  if (!stage1to2.subGoalPositioning) stage2MissingFields.push('中間目標の位置づけ');
  if (!stage1to2.achievabilityEvaluation) stage2MissingFields.push('達成可能性評価');

  const canAdvanceFromStage1 = stage1MissingFields.length === 0;
  const canAdvanceFromStage2 = stage2MissingFields.length === 0;

  const canGoNext =
    currentStage === 1 ? canAdvanceFromStage1 : currentStage === 2 ? canAdvanceFromStage2 : false;
  const missingFields =
    currentStage === 1 ? stage1MissingFields : currentStage === 2 ? stage2MissingFields : [];

  function handleSelectStage(stage: StageNumber) {
    if (stage <= currentStage) {
      setCurrentStage(stage);
      return;
    }
    if (stage === 2 && canAdvanceFromStage1) {
      setCurrentStage(2);
      return;
    }
    if (stage === 3 && canAdvanceFromStage1 && canAdvanceFromStage2) {
      setCurrentStage(3);
    }
  }

  const scopeLabel =
    selectedLapIndex == null
      ? `全体 (${formatDistance(totalDistanceM / 1000)}, ${segments.length} 区間)`
      : `Lap ${selectedLapIndex} (${formatDistance(totalDistanceM / 1000)}, ${segments.length} 区間)`;

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

      {segments.length > 0 && (
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
          <SegmentChart segments={segments} />
        </section>
      )}

      {segments.length > 0 && (
        <section className="phase4">
          <h2>AI 相談用プロンプト</h2>
          <StageNavigator
            currentStage={currentStage}
            canGoNext={canGoNext}
            missingFields={missingFields}
            onPrev={() =>
              setCurrentStage((s) => (s === 1 ? 1 : ((s - 1) as StageNumber)))
            }
            onNext={() =>
              setCurrentStage((s) => (s === 3 ? 3 : ((s + 1) as StageNumber)))
            }
            onSelect={handleSelectStage}
          />
          {currentStage === 1 && (
            <>
              <Stage1Form values={raceForm} onChange={setRaceForm} />
              <PromptOutput stage={1} prompt={stage1Prompt} />
            </>
          )}
          {currentStage === 2 && (
            <>
              <Stage2Bridge
                values={stage1to2}
                onChange={setStage1to2}
                periodMode={periodMode}
              />
              <PromptOutput stage={2} prompt={stage2Prompt} />
            </>
          )}
          {currentStage === 3 && (
            <>
              <p className="bridge-form-guide">
                Stage 2 のプロンプトを AI に投げて推奨手法を確認してから、以下のプロンプトを実行してください。
              </p>
              <PromptOutput stage={3} prompt={stage3Prompt} />
            </>
          )}
        </section>
      )}

      {parseResult != null && (
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
