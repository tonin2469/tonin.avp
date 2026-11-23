const statusLabels = { pendente: 'Pendente', em_andamento: 'Em andamento', concluida: 'Concluída' };

function formatDate(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

export default function TaskItem({ task, onEdit, onDelete, busy }) {
  return (
    <article className={`task-card ${task.status === 'concluida' ? 'task-card--done' : ''}`}>
      <span className={`task-card__indicator task-card__indicator--${task.status}`} aria-hidden="true" />
      <div className="task-card__body">
        <div className="task-card__topline"><span className={`status-pill status-pill--${task.status}`}>{statusLabels[task.status] || 'Pendente'}</span>{task.dueDate && <span className="task-card__date"><span aria-hidden="true">◷</span> {formatDate(task.dueDate)}</span>}</div>
        <h3>{task.title}</h3>{task.description && <p>{task.description}</p>}
      </div>
      <div className="task-card__actions"><button className="icon-button" type="button" onClick={() => onEdit(task)} aria-label={`Editar ${task.title}`} title="Editar">✎</button><button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(task)} disabled={busy} aria-label={`Excluir ${task.title}`} title="Excluir">×</button></div>
    </article>
  );
}