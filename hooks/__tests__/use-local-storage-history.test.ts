/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useLocalStorageHistory } from '../use-local-storage-history';

describe('useLocalStorageHistory', () => {
  const KEY = 'test-history';

  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with empty history if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorageHistory(KEY));
    expect(result.current.history).toEqual([]);
  });

  it('should initialize with stored history', () => {
    const stored = ['item1', 'item2'];
    window.localStorage.setItem(KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useLocalStorageHistory(KEY));

    expect(result.current.history).toEqual(stored);
  });

  it('should add item to history', () => {
    const { result } = renderHook(() => useLocalStorageHistory(KEY));

    act(() => {
      result.current.addToHistory('newItem');
    });

    expect(result.current.history).toEqual(['newItem']);
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toEqual(['newItem']);
  });

  it('should deduplicate items and move to top', () => {
    const { result } = renderHook(() => useLocalStorageHistory(KEY));

    act(() => {
      result.current.addToHistory('first');
    });
    act(() => {
      result.current.addToHistory('second');
    });
    act(() => {
      result.current.addToHistory('first');
    });

    expect(result.current.history).toEqual(['first', 'second']);
  });

  it('should respect the limit', () => {
    const { result } = renderHook(() => useLocalStorageHistory(KEY, 3));

    act(() => { result.current.addToHistory('1'); });
    act(() => { result.current.addToHistory('2'); });
    act(() => { result.current.addToHistory('3'); });
    act(() => { result.current.addToHistory('4'); });

    expect(result.current.history).toEqual(['4', '3', '2']);
    expect(result.current.history.length).toBe(3);
  });

  it('should ignore empty strings', () => {
      const { result } = renderHook(() => useLocalStorageHistory(KEY));

      act(() => { result.current.addToHistory('  '); });

      expect(result.current.history).toEqual([]);
  });
});
