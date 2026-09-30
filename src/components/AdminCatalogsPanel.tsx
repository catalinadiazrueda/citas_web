import { useEffect, useState } from 'react';
import { adminApi, catalogsApi, schedulingErrorMessage } from '../api/schedulingApi';
import type { CatalogItem } from '../types';

type Eps = { id: string; code: string; name: string; active: boolean };
type Plan = Eps & { epsId: string; regimeId: string };
const input = 'w-full p-2.5 border border-slate-200 rounded-xl text-sm';

export function AdminCatalogsPanel() {
  const [eps, setEps] = useState<Eps[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [regimes, setRegimes] = useState<CatalogItem[]>([]);
  const [epsForm, setEpsForm] = useState({ code: '', name: '' });
  const [planForm, setPlanForm] = useState({ epsId: '', regimeId: '', code: '', name: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setError('');
    try {
      const [nextEps, nextPlans, nextRegimes] = await Promise.all([adminApi.eps(), adminApi.plans(), catalogsApi.regimes()]);
      setEps(nextEps); setPlans(nextPlans); setRegimes(nextRegimes);
      setPlanForm((current) => ({ ...current, epsId: current.epsId || nextEps.find((item) => item.active)?.id || '', regimeId: current.regimeId || nextRegimes[0]?.id || '' }));
    } catch (cause) { setError(schedulingErrorMessage(cause)); }
  };
  useEffect(() => { void load(); }, []);

  const saveEps = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    try { await adminApi.saveEps(undefined, { ...epsForm, active: true }); setEpsForm({ code: '', name: '' }); setNotice('EPS creada.'); await load(); }
    catch (cause) { setError(schedulingErrorMessage(cause)); }
  };
  const savePlan = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    try { await adminApi.savePlan(undefined, { ...planForm, active: true }); setPlanForm((current) => ({ ...current, code: '', name: '' })); setNotice('Plan creado.'); await load(); }
    catch (cause) { setError(schedulingErrorMessage(cause)); }
  };

  const toggleEps = async (item: Eps) => {
    try { await adminApi.saveEps(item.id, { code: item.code, name: item.name, active: !item.active }); await load(); }
    catch (cause) { setError(schedulingErrorMessage(cause)); }
  };
  const togglePlan = async (item: Plan) => {
    try { await adminApi.savePlan(item.id, { epsId: item.epsId, regimeId: item.regimeId, code: item.code, name: item.name, active: !item.active }); await load(); }
    catch (cause) { setError(schedulingErrorMessage(cause)); }
  };

  return <section className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
    <div><h2 className="text-lg font-bold">EPS y planes</h2><p className="text-xs text-slate-500">Los catálogos referenciados se desactivan; no se eliminan físicamente.</p></div>
    {error && <p role="alert" className="p-3 text-sm text-red-700 bg-red-50 rounded-xl">{error}</p>}
    {notice && <p role="status" className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl">{notice}</p>}
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3"><h3 className="font-semibold text-sm">Entidades promotoras</h3>
        <form onSubmit={saveEps} className="grid sm:grid-cols-[1fr_2fr_auto] gap-2"><input className={input} required maxLength={30} aria-label="Código EPS" placeholder="Código" value={epsForm.code} onChange={(event) => setEpsForm({ ...epsForm, code: event.target.value })} /><input className={input} required maxLength={150} aria-label="Nombre EPS" placeholder="Nombre EPS" value={epsForm.name} onChange={(event) => setEpsForm({ ...epsForm, name: event.target.value })} /><button className="px-3 py-2 bg-blue-600 text-white text-xs rounded-xl">Crear</button></form>
        <div className="space-y-2">{eps.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl text-sm"><span>{item.name}<small className="block text-slate-500">{item.code} · {item.active ? 'Activa' : 'Inactiva'}</small></span><button type="button" onClick={() => void toggleEps(item)} className="text-xs text-blue-700">{item.active ? 'Desactivar' : 'Activar'}</button></div>)}</div>
      </div>
      <div className="space-y-3"><h3 className="font-semibold text-sm">Planes</h3>
        <form onSubmit={savePlan} className="grid sm:grid-cols-2 gap-2"><select className={input} required aria-label="EPS del plan" value={planForm.epsId} onChange={(event) => setPlanForm({ ...planForm, epsId: event.target.value })}><option value="">EPS</option>{eps.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className={input} required aria-label="Régimen del plan" value={planForm.regimeId} onChange={(event) => setPlanForm({ ...planForm, regimeId: event.target.value })}><option value="">Régimen</option>{regimes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input className={input} required maxLength={50} aria-label="Código del plan" placeholder="Código" value={planForm.code} onChange={(event) => setPlanForm({ ...planForm, code: event.target.value })} /><input className={input} required maxLength={150} aria-label="Nombre del plan" placeholder="Nombre del plan" value={planForm.name} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} /><button className="sm:col-span-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-xl">Crear plan</button></form>
        <div className="space-y-2">{plans.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl text-sm"><span>{item.name}<small className="block text-slate-500">{item.code} · {item.active ? 'Activo' : 'Inactivo'}</small></span><button type="button" onClick={() => void togglePlan(item)} className="text-xs text-blue-700">{item.active ? 'Desactivar' : 'Activar'}</button></div>)}</div>
      </div>
    </div>
  </section>;
}
