import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { InsightsPage } from '@/pages/InsightsPage'
import { InstitutionViewPage } from '@/pages/InstitutionViewPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RepeatCustomersPage } from '@/pages/RepeatCustomersPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SocialCommercePage } from '@/pages/SocialCommercePage'
import { TransactionsPage } from '@/pages/TransactionsPage'

export default function App() {
  return (
    <Routes>
      {/* The bank-facing view sits outside the merchant layout and is not in the sidebar. */}
      <Route path="institution-view/:shareId" element={<InstitutionViewPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="social-commerce" element={<SocialCommercePage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="repeat-customers" element={<RepeatCustomersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
