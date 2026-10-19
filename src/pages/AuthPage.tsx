import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
export function AuthPage({ signup = false }: { signup?: boolean }) {
  const auth = useAuth(), navigate = useNavigate();
  const [error, setError] = useState(''), [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      if (signup) await auth.signUp(String(form.get('name')), String(form.get('email')), String(form.get('password')));
      else await auth.signIn(String(form.get('email')), String(form.get('password')));
      navigate('/');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); }
    finally { setPending(false); }
  }
  return <section className="auth"><div><span className="eyebrow">PERSONAL FINANCE, SIMPLIFIED</span>
    <h1>Keep more of what matters.</h1><p>Retain turns everyday spending into calm, useful clarity.</p></div>
    <form onSubmit={submit}><h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
      {error && <p role="alert" className="error">{error}</p>}
      {signup && <label>Name<input required maxLength={100} name="name" autoComplete="name" placeholder="Your name" /></label>}
      <label>Email<input required type="email" name="email" autoComplete="email" placeholder="you@example.com" /></label>
      <label>Password<input required minLength={6} maxLength={72} type="password" name="password"
        autoComplete={signup ? 'new-password' : 'current-password'} placeholder="At least 6 characters" /></label>
      <button disabled={pending}>{pending ? 'Please wait…' : signup ? 'Start managing money' : 'Sign in'}</button>
      <p>{signup ? 'Already have an account?' : 'New to Retain?'} <Link to={signup ? '/signin' : '/signup'} onClick={() => setError('')}>
        {signup ? 'Sign in' : 'Create one'}</Link></p>
    </form>
  </section>;
}
