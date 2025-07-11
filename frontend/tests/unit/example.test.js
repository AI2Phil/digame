// Example unit test to verify Jest configuration
describe('Jest Configuration Test', () => {
  test('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  test('should have access to DOM testing utilities', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello World'
    expect(div.textContent).toBe('Hello World')
  })

  test('should have localStorage available', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.setItem).toBeDefined()
    expect(typeof localStorage.setItem).toBe('function')
  })
})