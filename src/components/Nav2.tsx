import logoIcon from '../assets/icon-logo.svg'
import insightsIcon from '../assets/icon-insights.svg'
import canvasIcon from '../assets/icon-canvas.svg'
import orgTreeIcon from '../assets/icon-org-tree.svg'
import teamsIcon from '../assets/icon-teams.svg'
import accountMgmtIcon from '../assets/icon-account-mgmt.svg'
import settingsIcon from '../assets/icon-settings.svg'
import projectIcon from '../assets/icon-project.svg'

export type Nav2Section =
  | 'project'
  | 'insights'
  | 'canvas'
  | 'org-tree'
  | 'teams'
  | 'account-mgmt'
  | 'settings'

interface Nav2Props {
  activeSection: Nav2Section
  onSectionChange?: (section: Nav2Section) => void
  onThemeToggle?: () => void
  dark?: boolean
}

const activeFilter = 'brightness(0) invert(72%) sepia(50%) saturate(500%) hue-rotate(175deg) brightness(105%)'
const hoverFilter = 'brightness(0) invert(1)'

const topGroup: { id: Nav2Section; icon: string; alt: string; size?: string; href?: string }[] = [
  { id: 'insights', icon: insightsIcon, alt: 'Insights', size: 'h-[17px] w-[17px]', href: '/insights' },
  { id: 'canvas', icon: canvasIcon, alt: 'Canvas', size: 'h-[17px] w-[17px]', href: '/canvas' },
]

const bottomGroup: { id: Nav2Section; icon: string; alt: string }[] = [
  { id: 'org-tree', icon: orgTreeIcon, alt: 'Org Tree' },
  { id: 'teams', icon: teamsIcon, alt: 'Teams' },
  { id: 'account-mgmt', icon: accountMgmtIcon, alt: 'Account Management' },
]

function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: { id: Nav2Section; icon: string; alt: string; size?: string; href?: string }
  isActive: boolean
  onClick: () => void
}) {
  const imgClass = item.size ?? 'h-5 w-5'

  const handleClick = () => {
    onClick()
    if (item.href) {
      window.location.href = item.href
    }
  }

  if (isActive) {
    return (
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90"
        onClick={handleClick}
      >
        <img src={item.icon} alt={item.alt} className={imgClass} style={{ filter: activeFilter }} />
      </button>
    )
  }

  return (
    <button
      className="nav2-item flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/90"
      onClick={handleClick}
    >
      <img src={item.icon} alt={item.alt} className={imgClass} />
    </button>
  )
}

export function Nav2({ activeSection, onSectionChange, onThemeToggle, dark }: Nav2Props) {
  return (
    <>
      <style>{`
        .nav2-item:hover img { filter: ${hoverFilter}; }
        .nav2-theme-btn:hover svg { filter: ${hoverFilter}; }
      `}</style>
      <nav className="flex w-[80px] shrink-0 flex-col items-center justify-between py-4" style={{ backgroundColor: '#051A33' }}>
        <div className="flex flex-col items-center gap-1">
          {/* Logo */}
          <img src={logoIcon} alt="Harness" className="my-3 h-[26px] w-[26px]" />
          {/* Green accent line */}
          <hr className="w-[50px] my-3 border-[1.5px] border-[#42AB45]" />
          {/* Project */}
          <button
            className="flex h-10 w-9 my-3 items-center justify-center rounded-[6px] border border-[#6C6D87] bg-[#121725]"
            onClick={() => onSectionChange?.('project')}
          >
            <img src={projectIcon} alt="Project" className="h-5 w-5" />
          </button>
          {/* Top nav group */}
          {topGroup.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange?.(item.id)}
            />
          ))}
          {/* Divider */}
          <hr className="my-3 w-[50px] border-[#6C6D87]" />
          {/* Bottom nav group */}
          {bottomGroup.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange?.(item.id)}
            />
          ))}
          {/* Divider */}
          <hr className="my-3 w-[50px] border-[#6C6D87]" />
          {/* Settings */}
          <NavItem
            item={{ id: 'settings', icon: settingsIcon, alt: 'Settings' }}
            isActive={activeSection === 'settings'}
            onClick={() => onSectionChange?.('settings')}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-4">
          <hr className="w-full border-[#6C6D87]" />
          {onThemeToggle && (
            <button
              className="nav2-theme-btn flex h-5 w-5 items-center justify-center"
              onClick={onThemeToggle}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {dark ? (
                  <circle cx="10" cy="10" r="5" stroke="#6C6D87" strokeWidth="1.5" />
                ) : (
                  <path d="M10 2a8 8 0 1 0 0 16 6 6 0 0 1 0-16Z" stroke="#6C6D87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          )}
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-cn-full bg-[#6C63FF]">
            <span className="text-xs font-semibold text-white">JH</span>
          </div>
        </div>
      </nav>
    </>
  )
}
