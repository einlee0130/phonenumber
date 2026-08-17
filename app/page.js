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
  const [showForm, setShowForm] = useState(false)

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

  useEffect(() => {
    getContacts()
  }, [])

  async function saveContact(e) {
  e.preventDefault()

  const cleanName = name.trim()
  const cleanPhone = phone.trim()
  const cleanMemo = memo.trim()

  if (!cleanName || !cleanPhone) {
    alert('이름과 전화번호를 입력해주세요.')
    return
  }

  // 중복 전화번호 확인
  let duplicateQuery = supabase
    .from('contacts')
    .select('id, name, phone')
    .eq('phone', cleanPhone)

  // 수정 중이라면 현재 연락처는 중복 검사에서 제외
  if (editingId) {
    duplicateQuery = duplicateQuery.neq('id', editingId)
  }

  const { data: duplicate, error: duplicateError } =
    await duplicateQuery

  if (duplicateError) {
    console.error(duplicateError)
    alert('중복 전화번호를 확인하지 못했습니다.')
    return
  }

  if (duplicate.length > 0) {
    alert(
      `이미 등록된 전화번호예요.\n\n${duplicate[0].name} · ${duplicate[0].phone}`
    )
    return
  }

  if (editingId) {
    // 수정
    const { error } = await supabase
      .from('contacts')
      .update({
        name: cleanName,
        phone: cleanPhone,
        memo: cleanMemo || null,
      })
      .eq('id', editingId)

    if (error) {
      console.error(error)
      alert('수정에 실패했습니다.')
      return
    }
  } else {
    // 새 연락처 추가
    const { error } = await supabase
      .from('contacts')
      .insert({
        name: cleanName,
        phone: cleanPhone,
        memo: cleanMemo || null,
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

  async function saveContact(e) {
    e.preventDefault()

    if (!name.trim() || !phone.trim()) {
      alert('이름과 전화번호를 입력해주세요.')
      return
    }

    if (editingId) {
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
    } else {
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
    setShowForm(true)

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
    setShowForm(false)
  }

  const filteredContacts = contacts.filter((contact) => {
    const keyword = search.toLowerCase().trim()

    return (
      contact.name.toLowerCase().includes(keyword) ||
      contact.phone.includes(keyword) ||
      (contact.memo || '').toLowerCase().includes(keyword)
    )
  })

  return (
    <main className="phonebook">
      <header className="header">
        <div>
          <p className="eyebrow">MY CONTACTS</p>
          <h1>전화번호부</h1>
          <p className="count">
            총 <strong>{contacts.length}</strong>개의 연락처
          </p>
        </div>

        <button
          className="add-button"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <span>＋</span>
          연락처 추가
        </button>
      </header>

      {showForm && (
        <div className="form-area">
          <div className="form-header">
            <h2>{editingId ? '연락처 수정' : '새 연락처'}</h2>

            <button
              type="button"
              className="close-button"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={saveContact}>
            <div className="input-group">
              <label>이름 / 기업명</label>
              <input
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>전화번호</label>
              <input
                type="text"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>메모 <span>(선택)</span></label>
              <input
                type="text"
                placeholder="거래처 담당자"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="save-button">
                {editingId ? '수정하기' : '저장하기'}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-box">
        <span>⌕</span>
        <input
          type="text"
          placeholder="이름, 전화번호, 메모 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="search-result-count">
          {search ? (
            <>
              <strong>{filteredContacts.length}</strong>개의 검색 결과
            </>
          ) : (
              <>
                전체 <strong>{contacts.length}</strong>개
              </>
          )}
        </div>

        {search && (
          <button onClick={() => setSearch('')}>×</button>
        )}
      </div>

      <section className="contact-list">
        <div className="list-header">
          <span>이름</span>
          <span>전화번호</span>
          <span>메모</span>
          <span></span>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="empty">
            {search
              ? '검색 결과가 없어요.'
              : '아직 연락처가 없어요.'}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div className="contact-row" key={contact.id}>
              <div className="contact-name">
                {contact.name}
              </div>

              <div className="contact-phone">
                {contact.phone}
              </div>

              <div className="contact-memo">
                {contact.memo || '—'}
              </div>

              <div className="actions">
                <button onClick={() => editContact(contact)}>
                  수정
                </button>

                <button
                  className="delete"
                  onClick={() => deleteContact(contact.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  )
}