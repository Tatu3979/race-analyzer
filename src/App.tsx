import './App.css'

// Phase 1 ではタイトルだけのシンプルなシェル。
// Phase 2 以降で state と各コンポーネント (FileUploader, LapTable, ...) を順に追加していく起点。
function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1>Race Analyzer</h1>
        <p className="lede">
          FITファイルから区間ごとの走行データを分析し、AI相談用のプロンプトを生成します。
        </p>
      </header>
    </main>
  )
}

export default App
