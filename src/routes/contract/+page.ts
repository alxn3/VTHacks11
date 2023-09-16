import type { PageLoad, PageData } from './$types';
import { db } from '../../services/firebase/firebase'
import { getDoc, doc } from 'firebase/firestore';

export const load: PageLoad = async ({ params, url }) => {
    const id = url.searchParams.get('id');
    if (!id) {
        return { status: 400, body: 'ID not provided' };
    }

    try {
        console.log(id);
        const contractDocRef = doc(db, 'contracts', id);
        const contractSnapshot = await getDoc(contractDocRef);

        if (contractSnapshot.exists()) {
            return {
                props: {
                    post: {
                        title: contractSnapshot.data().title,
                        content: contractSnapshot.data().description
                    }
                }
            };
        } else {
            return { status: 404, body: 'Contract not found' };
        }
    } catch (error) {
        return { status: 500, body: `Error fetching contract: ${error.message}` };
    }
};