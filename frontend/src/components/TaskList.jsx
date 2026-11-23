import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, loading, busyTaskId, onEdit, onDelete }) {
  if (loading) return <div className="list-state"><span className="spinner spinner--dark" /><span>Buscando suas tarefas...</span></div>;
  if (tasks.length === 0) return <div className="empty-state"><span className="empty-state__icon" aria-hidden="true">✳</span><h3>A lista começa com uma ideia.</h3><p>Adicione sua primeira tarefa usando o formulário ao lado.</p></div>;
  return <div className="task-list">{tasks.map((task) => <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} busy={busyTaskId === task.id} />)}</div>;
}