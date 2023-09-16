import { db } from './firebase.ts';
import { collection, getDocs, addDoc } from 'firebase/firestore';

type DataType = {
    id?: string;
    // ... other fields
};

export async function fetchData() {
    const querySnapshot = await getDocs(collection(db, "VTHacks11"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addData(data: DataType) {
    return await addDoc(collection(db, "VTHacks11"), data);
}

// we can add updateData, deleteData functions, etc.
