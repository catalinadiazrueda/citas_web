import { useEffect, useState } from 'react';
import { catalogsApi, profileApi, schedulingErrorMessage } from '../api/schedulingApi';
import type { CatalogItem } from '../types';

type Profile = { firstName: string; lastName: string; email: string; phone: string };
type Affiliation = { planId?: string; membershipNumber?: string; planName?: string; epsName?: string; regimeName?: string };

const card = 'bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4';
const field = 'w-full p-3 border border-slate-200 rounded-xl text-sm';

export function ProfilePanel() {
  const [profile, setProfile] = useState<Profile>({ firstName: '', lastName: '', email: '', phone: '' });
  const [affiliation, setAffiliation] = useState<Affiliation>({});
  const [plans, setPlans] = useState<CatalogItem[]>([]);
  const [planId, setPlanId] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [nextProfile, nextAffiliation, nextPlans] = await Promise.all([
        profileApi.get(), profileApi.affiliation(), catalogsApi.insurancePlans(),
      ]);
      setProfile(nextProfile);
      setAffiliation(nextAffiliation);
      setPlanId(nextAffiliation.planId ?? '');
      setMembershipNumber(nextAffiliation.membershipNumber ?? '');
      setPlans(nextPlans);
    } catch (cause) {
      setError(schedulingErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setNotice('');
    try {
      setProfile(await profileApi.update(profile));
      setNotice('Perfil actualizado.');
    } catch (cause) { setError(schedulingErrorMessage(cause)); }
  };

  const saveAffiliation = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setNotice('');
    if (!planId || !membershipNumber.trim()) { setError('Selecciona un plan e ingresa el número de afiliación.'); return; }
    try {
      setAffiliation(await profileApi.updateAffiliation(planId, membershipNumber.trim()));
      setNotice('Afiliación actualizada.');
    } catch (cause) { setError(schedulingErrorMessage(cause)); }
  };

  return <section className={card} aria-labelledby="profile-title">
    <div><h2 id="profile-title" className="text-lg font-bold">Mi perfil y afiliación</h2><p className="text-xs text-slate-500">Actualiza tus datos de contacto y el plan asociado.</p></div>
    {error && <p role="alert" className="p-3 text-sm text-red-700 bg-red-50 rounded-xl">{error}</p>}
    {notice && <p role="status" className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl">{notice}</p>}
    {loading ? <p className="text-sm text-slate-500">Cargando perfil…</p> : <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={saveProfile} className="space-y-3">
        <h3 className="font-semibold text-sm">Datos personales</h3>
        <label className="block text-xs text-slate-600">Nombres<input className={field} required maxLength={120} value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} /></label>
        <label className="block text-xs text-slate-600">Apellidos<input className={field} required maxLength={120} value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} /></label>
        <label className="block text-xs text-slate-600">Correo<input className={field} required type="email" maxLength={254} value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
        <label className="block text-xs text-slate-600">Teléfono<input className={field} required maxLength={40} value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
        <button className="px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl">Guardar perfil</button>
      </form>
      <form onSubmit={saveAffiliation} className="space-y-3">
        <h3 className="font-semibold text-sm">Afiliación actual</h3>
        {affiliation.planName && <p className="text-xs text-slate-500">{affiliation.epsName} · {affiliation.planName} · {affiliation.regimeName}</p>}
        <label className="block text-xs text-slate-600">Plan EPS<select className={field} required value={planId} onChange={(event) => setPlanId(event.target.value)}><option value="">Selecciona un plan activo</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
        <label className="block text-xs text-slate-600">Número de afiliación<input className={field} required maxLength={80} value={membershipNumber} onChange={(event) => setMembershipNumber(event.target.value)} /></label>
        <button className="px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl">Guardar afiliación</button>
      </form>
    </div>}
  </section>;
}
