import { appointmentList } from '@/domain/visits/store/services/VisitServices';

describe('appointmentList', () => {
  const appointment = { id: 'a1' };

  it('accepts the plain list the schema documents', () => {
    expect(appointmentList([appointment])).toEqual([appointment]);
  });

  it('accepts a paginated reply', () => {
    expect(
      appointmentList({ count: 1, next: null, previous: null, results: [appointment] })
    ).toEqual([appointment]);
  });

  it('wraps a single created appointment in a list', () => {
    expect(appointmentList(appointment)).toEqual([appointment]);
  });

  it('treats anything else as no visits instead of crashing', () => {
    expect(appointmentList({ detail: 'odd' })).toEqual([]);
    expect(appointmentList(null)).toEqual([]);
  });
});
