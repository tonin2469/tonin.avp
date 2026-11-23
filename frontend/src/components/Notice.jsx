export default function Notice({ notice, onDismiss }) {
  if (!notice) return null;
  return (
    <div className={`notice notice--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
      <span className="notice__icon" aria-hidden="true">{notice.type === 'error' ? '!' : '✓'}</span>
      <p>{notice.message}</p>
      <button className="icon-button notice__close" type="button" onClick={onDismiss} aria-label="Fechar mensagem">×</button>
    </div>
  );
}