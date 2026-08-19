import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { LanguageProvider } from './contexts/LanguageContext'
import { HomePage } from './pages/HomePage'
import { AnalyzePage } from './pages/AnalyzePage'
import { DraftPage } from './pages/DraftPage'
import { SchemesPage } from './pages/SchemesPage'
import { HistoryPage } from './pages/HistoryPage'

function App() {
  return (
    <LanguageProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/draft" element={<DraftPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </MainLayout>
    </LanguageProvider>
  )
}

export default App
