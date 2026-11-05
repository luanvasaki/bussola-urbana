"use client";
import { useFormState } from "react-dom";
import { entrar } from "../../actions";
export default function Login() {
  const [st, act] = useFormState(entrar, null as { erro?: string } | null);
  return <div className="mx-auto mt-20 max-w-sm"><form action={act} className="card space-y-3 p-6">
    <h1 className="text-xl font-bold">Acesso do gestor</h1><p className="text-sm text-forest/70">Área restrita à gestão municipal.</p>
    <label className="lbl" htmlFor="s">Senha</label><input id="s" name="senha" type="password" className="inp" required autoFocus />
    {st?.erro && <p className="text-sm text-red-700">{st.erro}</p>}<button className="btn w-full">Entrar</button></form></div>;
}
