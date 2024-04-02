<script lang="ts">
	import type { PoliticalItem } from '$lib/types/PoliticalItem/PoliticalItem';
	import { czechPoliticalSubjects } from '$lib/consts/czechPoliticalSubjects';

	export let politicalItem: PoliticalItem;

	/**
	 * Get the source of the thumbnail (Firestore storage URL)
	 * It is assumed that the first file is the thumbnail
	 * To obtain resized image, add _200x200.webp instead of the file extension.
	 * Beware, there is tokenization of the file name, so the extension is not always the last part of the file name.
	 * @param files
	 */
	const getSrcOfThumbnail = (files: string[]) => {
		const thumbnailOriginalFile = files[0];
		const parameteresOfThumbnailInGet = thumbnailOriginalFile.split('?')[1];
		const thumbnailResizedFile =
			thumbnailOriginalFile.replace(/\.[^/.]+$/, '_200x200.webp') +
			'?' +
			parameteresOfThumbnailInGet;
		console.log(thumbnailResizedFile);
		console.log(thumbnailOriginalFile);
		return thumbnailResizedFile;
	};

	const srcOfThumbnail = getSrcOfThumbnail(politicalItem.files);

	const politicalSubjectIds = politicalItem.politicalSubjectIds;

	const politicalSubjects = politicalSubjectIds.map((id) => {
		return czechPoliticalSubjects.find((subject) => subject.id === id);
	});

	/** Transfer mass-printed to Mass Printed etc. */
	const materialType = politicalItem.type
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');

	/** Name consist of abbreviation of the party, type of material and year of election */
	const title = `${politicalSubjects.map((subject) => subject.abbreviation).join(', ')}`;
</script>

<div class="item-preview">
	<img src={srcOfThumbnail} alt="item image" />
	<h3>{title}</h3>
	<p>{materialType}, {politicalItem.year}</p>
	<a href="/items/{politicalItem.id}">More info</a>
</div>

<style>
	.item-preview {
		display: flex;
		flex-direction: column;
		align-items: left;
		max-width: 200px;
	}
	img {
		width: 100%;
		height: auto;
	}
	h3 {
		margin: 0;
		margin-top: 0.5rem;
		font-size: 1rem;
	}
	p {
		margin: 0;
	}
	a {
		color: var(--c-brand);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>