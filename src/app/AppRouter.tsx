import CareersPage from '../features/recruitment/presentation/CareersPage'
import RecruitmentDashboard from '../features/recruitment/presentation/RecruitmentDashboard'

function AppRouter() {
  return window.location.pathname === '/careers' ? <CareersPage /> : <RecruitmentDashboard />
}

export default AppRouter
