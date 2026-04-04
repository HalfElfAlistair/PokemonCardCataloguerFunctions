import type { Card, Cards, List, Lists } from "../types/dataTypes";

import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc } from "firebase/firestore";


// db refs
// users

const userRef = (uid: string) => {
    return doc(db, 'users', uid);
}

// cards

const cardsRef = (uid: string) => {
    return collection(userRef(uid), 'cards')
}

const cardRef = (uid: string, cardID: string) => {
    return doc(cardsRef(uid), cardID)
}

// lists

const listsRef = (uid: string) => {
    return collection(userRef(uid), 'lists')
}

const listRef = (uid: string, listName: string) => {
    return doc(listsRef(uid), listName)
}





// get requests

export const fetchUserCards = async (uid: string) => {
    const querySnapshot = await getDocs(cardsRef(uid));
    let data: Cards = {};
    querySnapshot.docs.forEach(doc => {
        const cardID = doc.id;
        data[cardID] = doc.data() as Card;
    });
    return data
}

export const fetchCardByID = async (uid: string, cardID: string) => {
    const cardFromDB = await getDoc(cardRef(uid, cardID));
    return cardFromDB.data();
}

export const fetchLists = async (uid: string) => {
    const querySnapshot = await getDocs(listsRef(uid));
    let data: Lists = {};
    querySnapshot.docs.forEach(doc => {
        const listID = doc.id;
        data[listID] = doc.data() as List;
    });
    return data
}

export const fetchListByName = async (uid: string, listName: string) => {
    return await getDoc(listRef(uid, listName))
}

export const fetchUserDecks = (uid: string) => {
    return {}
}

export const fetchUserSets = (uid: string) => {
    return {}
}


// add requests

export const addCard = async (uid: string, cardID: string, cardData: Card) => {
    await setDoc(cardRef(uid, cardID), {
        ...cardData
    }, { merge: true });
}

export const addList = async (uid: string, listName: string) => {
    await addDoc(listsRef(uid), {
        name: listName,
        cardIDs: []
    });
}


// update requests

export const updateCardCount = async (uid: string, cardID: string, count: number) => {
    await setDoc(cardRef(uid, cardID), {
        count
    }, { merge: true });
}

export const updateList = async (uid: string, listID: string, listData: List) => {
    await setDoc(listRef(uid, listID), {
        ...listData
    }, { merge: true });
}