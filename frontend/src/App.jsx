import { useEffect, useMemo, useState } from 'react';
import { ApiError, authApi, taskApi } from './api.js';
import AuthForm from './components/AuthForm.jsx';
import Notice from './components/Notice.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';

const TOKEN_KEY = 'orbit.authToken';
function getSavedToken() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }

export default function App() {
  const [token, setToken] = useState(getSavedToken);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notice, setNotice] = useState(null);
  const [booting, setBooting] = useState(Boolean(getSavedToken()));
  const [authBusy, setAuthBusy] = useState(false);
  const [taskBusy, setTaskBusy] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('todas');

  function clearSession() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* armazenamento indisponível */ }
    setToken(null); setUser(null); setTasks([]); setEditingTask(null);
  }
  function reportError(error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      setNotice({ type: 'error', message: 'Sua sessão expirou. Entre novamente para continuar.' });
      return;
    }
    setNotice({ type: 'error', message: error.message || 'Não foi possível concluir a operação.' });
  }
  async function loadTasks(authToken, showLoading = true) {
    if (showLoading) setLoadingTasks(true);
    try { const result = await taskApi.list(authToken); setTasks(result.data || []); }
    catch (error) { reportError(error); }
    finally { if (showLoading) setLoadingTasks(false); }
  }

  useEffect(() => {
    let active = true;
    const savedToken = getSavedToken();
    if (!savedToken) { setBooting(false); return () => { active = false; }; }
    async function restoreSession() {
      try {
        const result = await authApi.me(savedToken);
        if (!active) return;
        setToken(savedToken); setUser(result.user);
        await loadTasks(savedToken);
      } catch (error) {
        if (!active) return;
        clearSession();
        setNotice({ type: 'error', message: error.status === 401 ? 'Sua sessão expirou. Entre novamente.' : error.message });
      } finally { if (active) setBooting(false); }
    }
    restoreSession();
    return () => { active = false; };
  }, []);

  const visibleTasks = useMemo(() => filter === 'todas' ? tasks : tasks.filter((task) => task.status === filter), [filter, tasks]);
  const completedCount = tasks.filter((task) => task.status === 'concluida').length;

  async function handleAuthenticate({ mode, nome, email, password }) {
    setAuthBusy(true); setNotice(null);
    try {
      const result = mode === 'register' ? await authApi.register({ nome, email, password }) : await authApi.login({ email, password });
      try { localStorage.setItem(TOKEN_KEY, result.token); } catch { /* a sessão ainda funciona enquanto a página estiver aberta */ }
      setToken(result.token); setUser(result.user);
      setNotice({ type: 'success', message: mode === 'register' ? 'Conta criada com sucesso. Boas-vindas!' : 'Login realizado com sucesso.' });
      await loadTasks(result.token);
    } catch (error) {
      if (mode === 'login' && error instanceof ApiError && error.status === 401) {
        setNotice({ type: 'error', message: error.message });
      } else {
        reportError(error);
      }
    }
    finally { setAuthBusy(false); }
  }

  async function handleTaskSubmit(data) {
    setTaskBusy(true);
    try {
      const result = editingTask ? await taskApi.update(token, editingTask.id, data) : await taskApi.create(token, data);
      if (editingTask) {
        setTasks((current) => current.map((task) => task.id === result.data.id ? result.data : task));
        setNotice({ type: 'success', message: 'Tarefa atualizada com sucesso.' });
      } else {
        setTasks((current) => [result.data, ...current]);
        setNotice({ type: 'success', message: 'Tarefa adicionada com sucesso.' });
      }
      setEditingTask(null);
      return true;
    } catch (error) { reportError(error); }
    finally { setTaskBusy(false); }
    return false;
  }

  async function handleDelete(task) {
    if (!window.confirm(`Excluir “${task.title}”? Esta ação não pode ser desfeita.`)) return;
    setBusyTaskId(task.id);
    try {
      await taskApi.remove(token, task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      if (editingTask?.id === task.id) setEditingTask(null);
      setNotice({ type: 'success', message: 'Tarefa excluída com sucesso.' });
    } catch (error) { reportError(error); }
    finally { setBusyTaskId(null); }
  }
  function handleLogout() { clearSession(); setNotice({ type: 'success', message: 'Sessão encerrada. Até a próxima!' }); }

  if (booting) return <main className="boot-screen"><span className="brand__mark">o</span><span className="spinner spinner--dark" /><p>Preparando seu espaço...</p></main>;
  if (!user || !token) return <><Notice notice={notice} onDismiss={() => setNotice(null)} /><AuthForm onAuthenticate={handleAuthenticate} busy={authBusy} /></>;

  return (
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="#inicio"><span className="brand__mark">o</span><span>orbit</span></a><div className="topbar__right"><div className="user-chip"><span className="user-chip__avatar">{user.nome?.charAt(0)?.toUpperCase() || 'U'}</span><span>{user.nome}</span></div><button className="button button--quiet" type="button" onClick={handleLogout}>Sair <span aria-hidden="true">↗</span></button></div></header>
      <main className="dashboard" id="inicio">
        <Notice notice={notice} onDismiss={() => setNotice(null)} />
        <section className="welcome-row"><div><span className="eyebrow">SEU PAINEL DE FOCO</span><h1>Olá, {user.nome?.split(' ')[0]}<span className="wave">✳</span></h1><p>Organize suas prioridades. O resto vem um passo de cada vez.</p></div>
          <div className="progress-card"><span className="progress-card__label">PROGRESSO DE HOJE</span><div className="progress-card__value"><strong>{tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%</strong><span>{completedCount} de {tasks.length} concluídas</span></div><div className="progress-track"><span style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }} /></div></div>
        </section>
        <div className="dashboard-grid">
          <TaskForm task={editingTask} onSubmit={handleTaskSubmit} onCancel={() => setEditingTask(null)} busy={taskBusy} />
          <section className="tasks-section" aria-labelledby="tasks-heading">
            <div className="tasks-section__heading"><div><span className="eyebrow">SEU DIA, NO SEU RITMO</span><h2 id="tasks-heading">Minhas tarefas <span className="count-badge">{tasks.length}</span></h2></div>
              <label className="filter-control"><span className="sr-only">Filtrar tarefas</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="todas">Todas</option><option value="pendente">Pendentes</option><option value="em_andamento">Em andamento</option><option value="concluida">Concluídas</option></select></label>
            </div>
            <TaskList tasks={visibleTasks} loading={loadingTasks} busyTaskId={busyTaskId} onEdit={setEditingTask} onDelete={handleDelete} />
          </section>
        </div>
        <footer className="dashboard-footer"><span>UM PASSO DE CADA VEZ.</span><span>SEU ESPAÇO, SUAS CONQUISTAS.</span></footer>
      </main>
    </div>
  );
}