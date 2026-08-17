'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [contacts, setContacts] = useState([])

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

  return (
    <main>
      <h1>📞 전화번호부</h1>

      {contacts.map((contact) => (
        <div key={contact.id}>
          <h2>{contact.name}</h2>
          <p>{contact.phone}</p>
          {contact.memo && <p>{contact.memo}</p>}
        </div>
      ))}
    </main>
  )
}