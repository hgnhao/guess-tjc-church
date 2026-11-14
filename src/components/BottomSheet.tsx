import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Dipanggil setelah animasi buka selesai (untuk map.invalidateSize). */
  onOpened?: () => void;
  title: ReactNode;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Bottom sheet sederhana. Tidak bisa ditutup dengan swipe supaya gesture peta tidak menutupnya. */
export default function BottomSheet({ open, onClose, onOpened, title, headerExtra, footer, children }: Props) {
  return (
    <section
      className={`sheet${open ? ' open' : ''}`}
      aria-hidden={!open}
      inert={!open}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === 'transform' && open) onOpened?.();
      }}
    >
      <header className="sheet-head">
        <div className="sheet-title">{title}</div>
        {headerExtra}
        <button type="button" className="btn btn-ghost sheet-close" onClick={onClose}>
          ✕ Tutup
        </button>
      </header>
      <div className="sheet-body">{children}</div>
      {footer && <div className="sheet-foot">{footer}</div>}
    </section>
  );
}
