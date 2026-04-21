import { renderHook, act } from '@testing-library/react'
import { useLanguage } from './use-language'

describe('useLanguage', () => {
  it('defaults to zh-Hant', () => {
    const { result } = renderHook(() => useLanguage())
    expect(result.current.lang).toBe('zh-Hant')
  })

  it('toggles between zh-Hant and zh-Hans', () => {
    const { result } = renderHook(() => useLanguage())
    act(() => result.current.toggle())
    expect(result.current.lang).toBe('zh-Hans')
    act(() => result.current.toggle())
    expect(result.current.lang).toBe('zh-Hant')
  })

  it('respects custom default', () => {
    const { result } = renderHook(() => useLanguage('zh-Hans'))
    expect(result.current.lang).toBe('zh-Hans')
  })
})