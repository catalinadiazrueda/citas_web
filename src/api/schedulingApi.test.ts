import { afterEach, describe, expect, it, vi } from 'vitest';
import { SchedulingApiError, appointmentsApi, availabilityApi, schedulingErrorMessage } from './schedulingApi';

describe('schedulingApi', () => {
  afterEach(() => vi.restoreAllMocks());

  it('envía bloques con fecha y horas separadas', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: '7', locationId: '1', date: '2026-10-01', startTime: '08:00', endTime: '10:00' }), { status: 201 }));
    await availabilityApi.create({ locationId: '1', date: '2026-10-01', startTime: '08:00', endTime: '10:00' });
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual({ locationId: '1', date: '2026-10-01', startTime: '08:00', endTime: '10:00' });
  });

  it('expone 409 como error de horario ocupado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ detail: 'Franja ya reservada' }), { status: 409 }));
    await expect(appointmentsApi.create({ professionalId: '1', locationId: '1', specialtyId: '1', date: '2026-10-01', startTime: '08:00' })).rejects.toEqual(new SchedulingApiError(409, 'Franja ya reservada'));
    expect(schedulingErrorMessage(new SchedulingApiError(409, 'Franja ya reservada'))).toContain('dejó de estar disponible');
  });
});
