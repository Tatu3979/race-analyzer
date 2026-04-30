import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseFitFile } from '../utils/fit-analyzer';
import { getSampleFiles } from '../utils/sample-files';

type Props = {
  onParsed: (result: unknown) => void;
  onError: (message: string) => void;
};

const INVALID_EXT_MESSAGE = 'FITファイル（.fit）を選択してください';
const PARSE_FAIL_MESSAGE = 'FIT ファイルの読み込みに失敗しました';

function isFitFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.fit');
}

export default function FileUploader({ onParsed, onError }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const samples = getSampleFiles();

  const ingest = useCallback(
    async (file: File) => {
      if (!isFitFile(file)) {
        onError(INVALID_EXT_MESSAGE);
        return;
      }
      setIsLoading(true);
      try {
        const result = await parseFitFile(file);
        onParsed(result);
      } catch {
        onError(PARSE_FAIL_MESSAGE);
      } finally {
        setIsLoading(false);
      }
    },
    [onParsed, onError]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      void ingest(file);
    },
    [ingest]
  );

  const onDropRejected = useCallback(() => {
    onError(INVALID_EXT_MESSAGE);
  }, [onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { 'application/octet-stream': ['.fit'] },
    multiple: false,
    disabled: isLoading,
  });

  const onSampleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = e.target.value;
    if (!url) return;
    const sample = samples.find((s) => s.url === url);
    if (!sample) return;
    try {
      const blob = await fetch(url).then((r) => r.blob());
      await ingest(new File([blob], sample.name));
    } catch {
      onError(PARSE_FAIL_MESSAGE);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <section className="file-uploader">
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' is-drag-active' : ''}${isLoading ? ' is-loading' : ''}`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <>
            <p className="dropzone-primary">
              ここにFITファイルをドロップ、またはクリックで選択
            </p>
            <p className="dropzone-secondary">対応拡張子: .fit</p>
          </>
        )}
      </div>

      {samples.length > 0 && (
        <div className="sample-picker">
          <label>
            開発用サンプル:
            <select onChange={onSampleSelect} disabled={isLoading} defaultValue="">
              <option value="">— サンプルを選択 —</option>
              {samples.map((s) => (
                <option key={s.url} value={s.url}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </section>
  );
}
