import { useEffect, useState } from 'react';
import { appointmentsApi, operationsApi, schedulingErrorMessage } from '../api/schedulingApi';
import type { Appointment } from '../types';

const dateToday = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

export function MyAppointmentsPanel() {
  const [items, setItems] = useState<Appointment[]>([]); const [error, setError] = useState(''); const [date, setDate] = useState(''); const [status, setStatus] = useState('');
  const load = () => appointmentsApi.mine(status || undefined, date || undefined).then(setItems).catch((e) => setError(schedulingErrorMessage(e)));
  useEffect(() => { void load(); }, []);
  const cancel = async (id: string) => { try { await appointmentsApi.cancel(id); await load(); } catch (e) { setError(schedulingErrorMessage(e)); } };
  const reschedule = async (id: string) => { const newDate = window.prompt('Nueva fecha (YYYY-MM-DD)', dateToday); const time = window.prompt('Nueva hora (HH:mm)', '09:00'); if (!newDate || !time) return; try { await appointmentsApi.reschedule(id, newDate, time); await load(); } catch (e) { setError(schedulingErrorMessage(e)); } };
  return <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-bold">Mis citas</h2><div className="flex gap-2"><select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg text-xs p-2"><option value="">Todos los estados</option><option>APPROVED</option><option>REQUESTED</option><option>REJECTED</option><option>CANCELLED</option></select><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded-lg text-xs p-2" /><button onClick={() => void load()} className="text-xs text-blue-700">Filtrar</button></div></div>{error && <p role="alert" className="text-xs text-red-700">{error}</p>}{items.length ? items.map((item) => <article key={item.id} className="p-3 border rounded-xl text-sm"><strong>{item.specialtyName}</strong><p className="text-xs text-slate-500">{item.locationName} · {item.professionalName} · {item.startAt} · {item.status}</p>{item.rejectionReason && <p className="text-xs text-red-700">Motivo: {item.rejectionReason}</p>}<div className="mt-2 flex gap-3">{(item.status === 'APPROVED' || item.status === 'REQUESTED') && <button onClick={() => void cancel(item.id)} className="text-xs text-red-600">Cancelar</button>}{item.status === 'APPROVED' && <button onClick={() => void reschedule(item.id)} className="text-xs text-blue-700">Solicitar reprogramación</button>}</div></article>) : <p className="text-sm text-slate-500">No hay citas para estos filtros.</p>}</section>;
}

export function ProfessionalAgendaPanel() {
  const [items, setItems] = useState<Appointment[]>([]); const [error, setError] = useState(''); const load = () => operationsApi.agenda().then(setItems).catch((e) => setError(schedulingErrorMessage(e)));
  useEffect(() => { void load(); }, []);
  const close = async (id: string, status: 'COMPLETED' | 'NO_SHOW') => { try { await operationsApi.close(id, status); await load(); } catch (e) { setError(schedulingErrorMessage(e)); } };
  return <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3"><h2 className="text-lg font-bold">Mi agenda aprobada</h2>{error && <p role="alert" className="text-xs text-red-700">{error}</p>}{items.length ? items.map((item) => <div key={item.id} className="p-3 border rounded-xl text-sm"><strong>{item.specialtyName}</strong><p className="text-xs text-slate-500">{item.startAt} · {item.locationName}</p><button onClick={() => void close(item.id, 'COMPLETED')} className="mr-3 text-xs text-emerald-700">Completada</button><button onClick={() => void close(item.id, 'NO_SHOW')} className="text-xs text-red-600">No asistió</button></div>) : <p className="text-sm text-slate-500">No hay citas aprobadas.</p>}</section>;
}

export function AdminReschedulesPanel() {
  const [items, setItems] = useState<Appointment[]>([]); const [error, setError] = useState(''); const load = () => operationsApi.pendingReschedules().then(setItems).catch((e) => setError(schedulingErrorMessage(e)));
  useEffect(() => { void load(); }, []);
  const decide = async (id: string, decision: 'APPROVE' | 'REJECT') => { const reason = decision === 'REJECT' ? window.prompt('Motivo de rechazo') : undefined; if (decision === 'REJECT' && !reason) return; try { await operationsApi.decideReschedule(id, decision, reason ?? undefined); await load(); } catch (e) { setError(schedulingErrorMessage(e)); } };
  return <section className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3"><h2 className="text-lg font-bold">Reprogramaciones pendientes</h2>{error && <p role="alert" className="text-xs text-red-700">{error}</p>}{items.length ? items.map((item) => <div key={item.id} className="p-3 border rounded-xl text-sm"><strong>{item.specialtyName}</strong><p className="text-xs text-slate-500">{item.professionalName} · {item.locationName} · {item.startAt}</p><button onClick={() => void decide(item.id, 'APPROVE')} className="mr-3 text-xs text-emerald-700">Aprobar</button><button onClick={() => void decide(item.id, 'REJECT')} className="text-xs text-red-600">Rechazar</button></div>) : <p className="text-sm text-slate-500">No hay reprogramaciones pendientes.</p>}</section>;
}
