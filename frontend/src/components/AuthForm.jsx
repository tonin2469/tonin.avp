import { useState } from 'react';

export default function AuthForm({ onAuthenticate, busy }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = mode === 'register';

  async function handleSubmit(event) {
    event.preventDefault();
    await onAuthenticate({ mode, nome: name.trim(), email: email.trim(), password });
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <a className="brand brand--light" href="#inicio" aria-label="Orbit início"><span className="brand__mark">o</span><span>orbit</span></a>
        <div className="auth-story__content">
          <span className="eyebrow eyebrow--light">MENOS CAOS, MAIS FOCO</span>
          <h1>Um passo de cada vez.<br /><span>Você chega lá.</span></h1>
          <p>Planeje sua rotina, acompanhe o progresso e mantenha o que importa sempre à vista.</p>
          <div className="story-note"><span className="story-note__spark">✳</span><span>Pequenos avanços também são avanços.</span></div>
        </div>
        <div className="auth-story__footer"><span>FEITO PARA A VIDA REAL</span><span>01 — 03</span></div>
      </section>
      <section className="auth-panel" id="inicio">
        <div className="auth-panel__mobile-brand"><span className="brand__mark">o</span> orbit</div>
        <div className="auth-card">
          <div className="auth-card__intro">
            <span className="eyebrow">SEU ESPAÇO DE ORGANIZAÇÃO</span>
            <h2>{isRegister ? 'Crie sua conta' : 'Boas-vindas de volta'}</h2>
            <p>{isRegister ? 'Comece a organizar suas tarefas hoje.' : 'Entre para continuar de onde parou.'}</p>
          </div>
          <div className="auth-tabs" role="tablist" aria-label="Acesso à conta">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'is-active' : ''} onClick={() => changeMode('login')}>Entrar</button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'is-active' : ''} onClick={() => changeMode('register')}>Criar conta</button>
          </div>
          <form className="form-stack" onSubmit={handleSubmit}>
            {isRegister && <label className="field"><span>Seu nome</span><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Ana Silva" minLength={2} maxLength={100} required /></label>}
            <label className="field"><span>E-mail</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" required /></label>
            <label className="field"><span>Senha</span><input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? 'Mínimo de 8 caracteres' : 'Sua senha'} minLength={isRegister ? 8 : undefined} maxLength={72} required /></label>
            <button className="button button--primary button--wide" type="submit" disabled={busy}>
              {busy ? <><span className="spinner" /> Aguarde...</> : isRegister ? 'Criar minha conta' : 'Entrar na minha conta'}
              {!busy && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="auth-card__hint">{isRegister ? 'Ao criar sua conta, seus dados ficam protegidos.' : 'Seus dados são privados e só você pode acessar suas tarefas.'}</p>
        </div>
        <footer className="auth-panel__footer">ORGANIZE O PRESENTE. CONSTRUA O PRÓXIMO.</footer>
      </section>
    </main>
  );
}