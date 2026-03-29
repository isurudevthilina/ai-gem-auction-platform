import { useUiStore } from '../../stores/uiStore';
import { CheckCircle, XCircle, AlertTriangle, Info, Bell, X } from 'lucide-react';

const BODY = "'Jost', sans-serif";

const C = {
  green: '#16a34a',
  red: '#B91C1C',
  warning: '#B45309',
  sapphire: '#1A4D8C',
  gold: '#C4892A',
};

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  notification: Bell,
};

const borderColorMap = {
  success: C.green,
  error: C.red,
  warning: C.warning,
  info: C.sapphire,
  notification: C.gold,
};

const slideInKeyframes = `
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
`;

export default function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  if (!toasts.length) return null;

  return (
    <>
      <style>{slideInKeyframes}</style>
      <div
        style={{
          position: 'fixed',
          top: 80,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Bell;
          const borderColor = borderColorMap[toast.type] || C.gold;

          return (
            <div
              key={toast.id}
              onClick={() => {
                if (toast.onClick) toast.onClick();
                removeToast(toast.id);
              }}
              style={{
                width: 340,
                background: '#fff',
                borderRadius: 12,
                padding: '14px 16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                borderLeft: `4px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                cursor: toast.onClick ? 'pointer' : 'default',
                animation: 'toastSlideIn 0.25s ease',
              }}
            >
              <Icon size={18} color={borderColor} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#1E293B',
                      marginBottom: 2,
                    }}
                  >
                    {toast.title}
                  </div>
                )}
                {toast.message && (
                  <div
                    style={{
                      fontFamily: BODY,
                      fontSize: '0.72rem',
                      color: '#64748B',
                    }}
                  >
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  color: '#94a3b8',
                  fontFamily: BODY,
                  fontSize: '0.9rem',
                  lineHeight: 1,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
