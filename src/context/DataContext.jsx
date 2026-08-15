import React, { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase.js'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

function useCollection(name, order) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = order ? query(collection(db, name), orderBy(order)) : collection(db, name)
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => { console.error(name, err); setLoading(false) })
    return unsub
  }, [name, order])
  return [items, loading]
}

export function DataProvider({ children }) {
  const [members, membersLoading] = useCollection('members', 'name')
  const [sessions, sessionsLoading] = useCollection('sessions', 'date')
  const [activityTypes, actLoading] = useCollection('activityTypes', 'name')
  const [settlementRounds] = useCollection('settlementRounds', 'closedAt')
  const [paidMarks] = useCollection('paidMarks')

  const api = {
    members, sessions, activityTypes, settlementRounds, paidMarks,
    loading: membersLoading || sessionsLoading || actLoading,

    addMember: (data) => addDoc(collection(db, 'members'), { active: true, paymentMethods: [], ...data }),
    updateMember: (id, data) => updateDoc(doc(db, 'members', id), data),
    deleteMember: (id) => deleteDoc(doc(db, 'members', id)),

    addSession: (data) => addDoc(collection(db, 'sessions'), { attendeeIds: [], createdAt: serverTimestamp(), ...data }),
    updateSession: (id, data) => updateDoc(doc(db, 'sessions', id), data),
    deleteSession: (id) => deleteDoc(doc(db, 'sessions', id)),

    addActivityType: (name) => addDoc(collection(db, 'activityTypes'), { name }),

    closeSettlementRound: () => addDoc(collection(db, 'settlementRounds'), { closedAt: serverTimestamp() }),

    // key 格式：roundKey_from_to，用來標記某筆分帳是否已付款
    setPaidMark: (key, paid) => setDoc(doc(db, 'paidMarks', key), { paid }, { merge: true }),
  }

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}
