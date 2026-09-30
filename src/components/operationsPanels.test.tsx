import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePanel } from './ProfilePanel';
import { AdminCatalogsPanel } from './AdminCatalogsPanel';

const api = vi.hoisted(() => ({
  getProfile: vi.fn(), updateProfile: vi.fn(), getAffiliation: vi.fn(), updateAffiliation: vi.fn(),
  plans: vi.fn(), regimes: vi.fn(), eps: vi.fn(), saveEps: vi.fn(), adminPlans: vi.fn(), savePlan: vi.fn(),
  errorMessage: vi.fn(() => 'Error de prueba'),
}));

vi.mock('../api/schedulingApi', () => ({
  profileApi: { get: api.getProfile, update: api.updateProfile, affiliation: api.getAffiliation, updateAffiliation: api.updateAffiliation },
  catalogsApi: { insurancePlans: api.plans, regimes: api.regimes },
  adminApi: { eps: api.eps, saveEps: api.saveEps, plans: api.adminPlans, savePlan: api.savePlan },
  schedulingErrorMessage: api.errorMessage,
}));

describe('paneles de operación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getProfile.mockResolvedValue({ firstName: 'Ana', lastName: 'Ruiz', email: 'ana@example.test', phone: '3000000000' });
    api.getAffiliation.mockResolvedValue({ planId: '7', membershipNumber: 'AF-1', planName: 'Plan Demo', epsName: 'EPS Demo', regimeName: 'Contributivo' });
    api.plans.mockResolvedValue([{ id: '7', name: 'Plan Demo' }]);
    api.eps.mockResolvedValue([{ id: '1', code: 'EPS-D', name: 'EPS Demo', active: true }]);
    api.regimes.mockResolvedValue([{ id: '2', code: 'CON', name: 'Contributivo' }]);
    api.adminPlans.mockResolvedValue([]);
    api.updateProfile.mockImplementation(async (profile) => profile);
    api.updateAffiliation.mockResolvedValue({ planId: '7', membershipNumber: 'AF-2', planName: 'Plan Demo' });
    api.saveEps.mockResolvedValue({}); api.savePlan.mockResolvedValue({});
  });

  it('carga y permite guardar el perfil del usuario', async () => {
    const user = userEvent.setup();
    render(<ProfilePanel />);
    const firstName = await screen.findByLabelText('Nombres');
    await user.clear(firstName); await user.type(firstName, 'Ana María');
    await user.click(screen.getByRole('button', { name: 'Guardar perfil' }));
    await waitFor(() => expect(api.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Ana María' })));
    expect(await screen.findByRole('status')).toHaveTextContent('Perfil actualizado.');
  });

  it('permite crear una EPS y un plan con sus relaciones', async () => {
    const user = userEvent.setup();
    render(<AdminCatalogsPanel />);
    await screen.findByRole('button', { name: 'Desactivar' });
    await user.type(screen.getByLabelText('Código EPS'), 'EPS-N');
    await user.type(screen.getByLabelText('Nombre EPS'), 'EPS Nueva');
    await user.click(screen.getAllByRole('button', { name: 'Crear' })[0]);
    await waitFor(() => expect(api.saveEps).toHaveBeenCalledWith(undefined, { code: 'EPS-N', name: 'EPS Nueva', active: true }));

    await user.selectOptions(screen.getByLabelText('EPS del plan'), '1');
    await user.selectOptions(screen.getByLabelText('Régimen del plan'), '2');
    await user.type(screen.getByLabelText('Código del plan'), 'PLAN-N');
    await user.type(screen.getByLabelText('Nombre del plan'), 'Plan Nuevo');
    await user.click(screen.getByRole('button', { name: 'Crear plan' }));
    await waitFor(() => expect(api.savePlan).toHaveBeenCalledWith(undefined, { epsId: '1', regimeId: '2', code: 'PLAN-N', name: 'Plan Nuevo', active: true }));
  });
});
