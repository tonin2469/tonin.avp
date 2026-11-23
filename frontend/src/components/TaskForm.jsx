import { useEffect, useState } from 'react';

const emptyForm = { title: '', description: '', status: 'pendente', dueDate: '' };

export default function TaskForm({ task, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(emptyForm);
  useEffect(() => {
    setForm(task ? {
      title: task.title || '', description: task.description || '', status: task.status || 'pendente',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    } : emptyForm);
  }, [task]);

  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function handleSubmit(event) {
    event.preventDefault();
    const saved = await onSubmit({ title: form.title.trim(), description: form.description.trim() || null, status: form.status, dueDate: form.dueDate || null });
    if (saved && !task) setForm(emptyForm);
  }

  return (
    <section className="task-editor" aria-labelledby="task-editor-title">
      <div className="section-heading"><div><span className="eyebrow">{task ? 'ATUALIZE OS DETALHES' : 'TIRE DO PAPEL'}</span><h2 id="task-editor-title">{task ? 'Editar tarefa' : 'Nova tarefa'}</h2></div>{task && <button className="text-button" type="button" onClick={onCancel}>Cancelar edição</button>}</div>
      <form className="task-form" onSubmit={handleSubmit}>
        <label className="field task-form__title"><span>Título <i>*</i></span><input name="title" value={form.title} onChange={updateField} placeholder="O que você precisa fazer?" maxLength={150} required /></label>
        <label className="field task-form__description"><span>Descrição</span><textarea name="description" value={form.description} onChange={updateField} placeholder="Adicione mais detalhes (opcional)" maxLength={5000} rows={3} /></label>
        <div className="task-form__bottom">
          <label className="field"><span>Status</span><select name="status" value={form.status} onChange={updateField}><option value="pendente">Pendente</option><option value="em_andamento">Em andamento</option><option value="concluida">Concluída</option></select></label>
          <label className="field"><span>Prazo</span><input type="date" name="dueDate" value={form.dueDate} onChange={updateField} /></label>
          <button className="button button--primary task-form__submit" type="submit" disabled={busy}>{busy ? <><span className="spinner" /> Salvando</> : task ? 'Salvar alterações' : 'Adicionar tarefa'}{!busy && <span aria-hidden="true">→</span>}</button>
        </div>
      </form>
    </section>
  );
}