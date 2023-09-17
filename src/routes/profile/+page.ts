import type { PageLoad } from './$types';
import { db } from '../../services/firebase/firebase'
import { getDoc, doc } from 'firebase/firestore';

export const load: PageLoad = async ({ url }) => {
    const id = url.searchParams.get('uuid');
    if (!id) {
        return { status: 400, body: 'ID not provided' };
    }

    try {
        console.log(id);
        const contractSnapshot = await getDoc(doc(db, "users", id));
        console.log(contractSnapshot.data());
        if (contractSnapshot.exists()) {
            return contractSnapshot.data();
        } else {
            return { status: 404, body: 'User not found' };
        }
    } catch (error) {
        return { status: 500, body: `Error fetching user: ${error.message}` };
    }
};