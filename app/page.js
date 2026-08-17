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

  useEffect(() => {
    getContacts()
  }, [])

  async function getContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('phone', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setContacts(data || [])
  }

  async function saveContact(e) {
    e.preventDefault()

    const cleanName = name.trim()
    const cleanPhone = phone.trim()
    const cleanMemo = memo.trim()

    if (!cleanName || !cleanPhone) {
      alert('이름과 전화번호를 입력해주세요.')
      return
    }

    const { data: duplicate, error: duplicateError } = await supabase
      .from('contacts')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle()

    if (duplicateError) {
      console.error(duplicateError)
      alert('중복 확인에 실패했습니다.')
      return
    }

    if (duplicate && duplicate.id !== editingId) {
      alert('이미 등록된 전화번호입니다.')
      return
    }

    if (editingId) {
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

      alert('수정되었습니다.')
    } else {
      const { error } = await supabase
        .from('contacts')
        .insert({
          name: cleanName,
          phone: cleanPhone,
          memo: cleanMemo || null,
          is_favorite: false,
        })

      if (error) {
        console.error(error)
        alert('저장에 실패했습니다.')
        return
      }
    }

    resetForm()
    await getContacts()
  }

  async function toggleFavorite(contact) {
    const { error } = await supabase
      .from('contacts')
      .update({
        is_favorite: !contact.is_favorite,
      })
      .eq('id', contact.id)

    if (error) {
      console.error(error)
      alert('즐겨찾기 변경에 실패했습니다.')
      return
    }

    await getContacts()
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

    await getContacts()
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setPhone('')
    setMemo('')
    setShowForm(false)
  }

  function openAddForm() {
    resetForm()
    setShowForm(true)
  }

  const filteredContacts = contacts.filter((contact) => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return true

    return (
      contact.name?.toLowerCase().includes(keyword) ||
      contact.phone?.includes(keyword) ||
      contact.memo?.toLowerCase().includes(keyword)
    )
  })

  return (
    <main className="phonebook">
      <header className="header">
        <div>
          <p className="eyebrow">PRIVATE CONTACTS</p>

          <h1>📞 전화번호부</h1>

          <p className="count">
            총 <strong>{contacts.length}</strong>명
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="add-button"
            onClick={openAddForm}
          >
            <span>＋</span>
            연락처 추가
          </button>
        )}
      </header>

      {showForm && (
        <form className="form-area" onSubmit={saveContact}>
          <div className="form-header">
            <h2>{editingId ? '연락처 수정' : '연락처 추가'}</h2>

            <button
              type="button"
              className="close-button"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <div className="input-group">
            <label>이름 / 기업명</label>

            <input
              type="text"
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>전화번호</label>

            <input
              type="text"
              placeholder="예: 010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              메모 <span>(선택)</span>
            </label>

            <input
              type="text"
              placeholder="예: 엄마"
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
      )}

      <div className="search-box">
        <span>⌕</span>

        <input
          type="text"
          placeholder="이름, 전화번호 또는 메모 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
          >
            ×
          </button>
        )}
      </div>

      {search && (
        <p className="search-result-count">
          검색 결과 <strong>{filteredContacts.length}</strong>명
        </p>
      )}

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
              ? '검색 결과가 없습니다.'
              : '등록된 연락처가 없습니다.'}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="contact-row"
            >
              <div className="name-area">
                <button
                  type="button"
                  className={`favorite-button ${
                    contact.is_favorite ? 'active' : ''
                  }`}
                  onClick={() => toggleFavorite(contact)}
                  aria-label={
                    contact.is_favorite
                      ? '즐겨찾기 해제'
                      : '즐겨찾기 추가'
                  }
                >
                  {contact.is_favorite ? '★' : '☆'}
                </button>

                <span className="contact-name">
                  {contact.name}
                </span>
              </div>

              <span className="contact-phone">
                {contact.phone}
              </span>

              <span className="contact-memo">
                {contact.memo || '-'}
              </span>

              <div className="actions">
                <button
                  type="button"
                  onClick={() => editContact(contact)}
                >
                  수정
                </button>

                <button
                  type="button"
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