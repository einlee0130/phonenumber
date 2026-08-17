'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [contacts, setContacts] = useState([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [memo, setMemo] = useState('')
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState(null)

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

  async function saveContact(e) {
    e.preventDefault()

    if (!name.trim() || !phone.trim()) {
      alert('이름과 전화번호를 입력해주세요.')
      return
    }

    if (editingId) {
      // 수정
      const { error } = await supabase
        .from('contacts')
        .update({
          name: name.trim(),
          phone: phone.trim(),
          memo: memo.trim() || null,
        })
        .eq('id', editingId)

      if (error) {
        console.error(error)
        alert('수정에 실패했습니다.')
        return
      }

      alert('수정되었습니다.')
    } else {
      // 새 연락처 추가
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
    }

    resetForm()
    getContacts()
  }

  function editContact(contact) {
    setEditingId(contact.id)
    setName(contact.name)
    setPhone(contact.phone)
    setMemo(contact.memo || '')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function deleteContact(id) {
    const confirmed = confirm('이 연락처를 삭제할까요?')

    if (!confirmed) return

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('삭제에 실패했습니다.')
      return
    }

    getContacts()
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setPhone('')
    setMemo('')
  }

  return (
    <main>
      <h1>📞 전화번호부</h1>

      <form onSubmit={saveContact}>
        <h2>{editingId ? '연락처 수정' : '연락처 추가'}</h2>

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

        <button type="submit">
          {editingId ? '수정하기' : '＋ 연락처 추가'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            취소
          </button>
        )}
      </form>

      <hr />

      <input
        type="text"
        placeholder="🔍 이름 또는 전화번호 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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

              <button onClick={() => editContact(contact)}>
                수정
              </button>

              <button onClick={() => deleteContact(contact.id)}>
                삭제
              </button>
            </div>
          ))}
      </section>
    </main>
  )
}