import {
	createBaseQuery,
	withFilter,
	withOrderBy,
	withLimit,
	executeQuery
} from '$lib/services/firestoreServices';
import { db } from '$lib/firebase';
import {
	type QueryDocumentSnapshot,
	type DocumentData,
	type QueryConstraint,
	getDoc,
	doc
} from 'firebase/firestore';
import { isValidPoliticalItem, type PoliticalItem } from '$lib/types/PoliticalItem/PoliticalItem';
import { type PoliticalItemFilter } from '$lib/types/PoliticalItem/PoliticalItemFilter';

/**
 * Retrieves a list of political items from the database.
 * @param lastVisible - The last visible document from the previous query. Null if it's the first query.
 * @param limit - The number of documents to retrieve
 * @returns
 */
export const getPoliticalItems = async (
	lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
	limit: number = 10
) => {
	const baseQuery = createBaseQuery(
		db,
		'political_items',
		withOrderBy('year', 'desc'),
		withLimit(limit)
	);
	return executeQuery(baseQuery, lastVisible);
};

/**
 * Gets a single political item from the database.
 * @param id - The id of the political item to retrieve.
 */
export const getPoliticalItem = async (id: string): Promise<PoliticalItem> => {
	console.log(id, 'id in getPoliticalItem');
	// directly access document by id (no need to query)
	const docRef = doc(db, 'political_items', id);
	const docSnap = await getDoc(docRef);
	if (!docSnap.exists()) {
		throw new Error('No such document!');
	}
	const item = { ...docSnap.data(), id };
	return parseDbPoliticalItem(item);
};

const createBaseConstraintsFromFilter = (filter: PoliticalItemFilter): QueryConstraint[] => {
	const constraints: QueryConstraint[] = [];

	if (filter.type !== null) constraints.push(withFilter('type', '==', filter.type));
	if (filter.year.from) constraints.push(withFilter('year', '>=', filter.year.from));
	if (filter.year.to) constraints.push(withFilter('year', '<', filter.year.to));
	if (filter.politicalParty.length > 0) {
		constraints.push(
			withFilter('politicalSubjectIds', 'array-contains-any', filter.politicalParty)
		);
	}
	if (filter.electionType.length > 0) {
		constraints.push(withFilter('typeOfElectionId', 'in', filter.electionType));
	}
	constraints.push(withOrderBy(filter.order.by, filter.order.direction));

	console.log(constraints, 'constraints');

	return constraints;
};

export const getPoliticalItemsByFilter = async (
	filter: PoliticalItemFilter,
	lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
	limit: number = 10
): Promise<{ items: PoliticalItem[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
	const baseQuery = createBaseQuery(
		db,
		'political_items',
		withLimit(limit),
		...createBaseConstraintsFromFilter(filter)
	);

	const querySnapshot = await executeQuery(baseQuery, lastVisible);
	const items: PoliticalItem[] = [];

	querySnapshot.items.forEach((item: DocumentData) => {
		try {
			items.push(parseDbPoliticalItem(item));
		} catch (error) {
			console.error(error);
		}
	});

	return { items, lastVisible: querySnapshot.lastVisible };
};

const parseDbPoliticalItem = (item: DocumentData): PoliticalItem => {
	if (!isValidPoliticalItem(item)) throw new Error('Invalid political item');
	return item;
};
