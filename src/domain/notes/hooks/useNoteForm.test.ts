import { act, renderHook } from '@testing-library/react-native';

import { useNoteForm } from '@/domain/notes/hooks/useNoteForm';

describe('useNoteForm isDirty', () => {
  it('is clean until a field changes, and clean again once it is cleared', async () => {
    const { result } = await renderHook(() => useNoteForm([], {}));
    expect(result.current.isDirty).toBe(false);

    await act(() => result.current.setValue('goals', 'Walk 50 ft'));
    expect(result.current.isDirty).toBe(true);

    await act(() => result.current.setValue('goals', ''));
    expect(result.current.isDirty).toBe(false);
  });

  it('treats a changed prefilled answer as a change', async () => {
    const { result } = await renderHook(() => useNoteForm([], { goals: 'Walk 50 ft' }));

    await act(() => result.current.setValue('goals', 'Walk 100 ft'));
    expect(result.current.isDirty).toBe(true);
  });
});
