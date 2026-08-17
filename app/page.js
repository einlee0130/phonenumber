'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [contacts, setContacts] = useState([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [memo, setMemo] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getContacts()
  }, [])

  async function getContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setContacts(data)
  }

  async function addContact(e) {
    e.preventDefault()

    if (!name.trim() || !phone.trim()) {
      alert('이름과 전화번호를 입력해주세요.')
      return
    }

    const { error } = await supabase
      .from('contacts')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        memo: memo.trim() || null,
      })

    if (error) {
      console.error(error)
      alert('저장에 실패했습니다.')
      return
    }

    setName('')
    setPhone('')
    setMemo('')

    getContacts()
  }

  return (
    <main>
      <h1>📞 전화번호부</h1>
      <input 
        type="text"
        placeholder="🔍 이름 또는 전화번호 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <form onSubmit={addContact}>
        <input
          type="text"
          placeholder="이름 / 기업명"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="메모 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <button type="submit">＋ 연락처 추가</button>
      </form>

      <hr />

      <section>
        {contacts
          .filter((contact) => {
            const keyword = search.toLowerCase()

            return (
              contact.name.toLowerCase().includes(keyword) ||
              contact.phone.includes(keyword)
            )
          })
  .map((contact) => (
          <div key={contact.id}>
            <h2>{contact.name}</h2>
            <p>{contact.phone}</p>
            {contact.memo && <p>{contact.memo}</p>}
          </div>
        ))}
      </section>
    </main>
  )
}