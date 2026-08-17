'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()

    if (!password) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '비밀번호가 틀렸습니다.')
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('로그인에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-box">
        <div className="lock-icon">
          🔒
        </div>

        <p className="login-eyebrow">PRIVATE CONTACTS</p>

        <h1>전화번호부</h1>

        <p className="login-description">
          비밀번호를 입력하면<br />
          전화번호부에 들어갈 수 있어요.
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="암호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          <button type="submit" disabled={loading}>
            {loading ? '확인 중...' : '들어가기'}
          </button>
        </form>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}