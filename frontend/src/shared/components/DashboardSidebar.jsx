import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';

const C = {
  sapphire: '#1A4D8C',
  gold: '#C4892A',
  white: '#FFFFFF',
};
const BODY = "'Jost','Inter',sans-serif";

export const SIDEBAR_W = 88;
const COLLAPSED_W = 56;

const DashboardSidebar = ({
  navItems,
  activeTab,
  onTabChange,
  role,
  displayName,
  initials,
  pendingCount = 0,
  onSignOut,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const w = collapsed ? COLLAPSED_W : SIDEBAR_W;

  const isActive = (item) => {
    if (item.path) return location.pathname === item.path;
    return activeTab === item.id;
  };

  const handleClick = (item) => {
    if (item.path) navigate(item.path);
    else if (onTabChange) onTabChange(item.id);
  };

  return (
    <aside style={{
      width: w, position: 'fixed', top: 88, left: 0, bottom: 0,
      background: C.sapphire, display: 'flex', flexDirection: 'column',
      zIndex: 50, transition: 'width 0.2s ease', overflow: 'hidden',
    }}>
      {/* Hamburger toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px 0 16px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <Menu size={22} color={C.white} strokeWidth={2} />
      </button>

      {/* Nav items */}
      <nav style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 2, padding: '4px 0',
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4, width: w - 12, padding: '10px 2px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                color: active ? C.white : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s', position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 24, borderRadius: '0 3px 3px 0', background: C.gold,
                }} />
              )}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && (
                <span style={{
                  fontSize: '0.58rem', fontFamily: BODY, fontWeight: active ? 700 : 500,
                  letterSpacing: '0.01em', textAlign: 'center', lineHeight: 1.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}>
                  {item.label}
                </span>
              )}
              {item.badge && pendingCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: collapsed ? 4 : 8,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: C.gold, color: '#fff',
                  fontSize: '0.5rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: user info + sign out */}
      <div style={{
        padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.white, fontWeight: 700, fontSize: '0.7rem', fontFamily: BODY,
        }}>
          {initials}
        </div>
        {!collapsed && (
          <>
            <div style={{
              color: C.white, fontWeight: 600, fontSize: '0.62rem',
              fontFamily: BODY, textAlign: 'center',
              maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {displayName}
            </div>
            <div style={{
              color: C.gold, fontSize: '0.5rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: BODY,
            }}>
              {role}
            </div>
          </>
        )}
        <button
          onClick={onSignOut}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', fontSize: '0.58rem', fontFamily: BODY,
            padding: '4px 0', transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <LogOut size={13} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
