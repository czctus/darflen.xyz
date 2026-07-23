import { DarflenClient, Profile } from "darflen.ts";

import { EmbedCutoff, EmbedLineCutoff } from "./constants.js";

export const darflen = new DarflenClient();

export function clean(str: string) {
	return str
		// html

		.replaceAll('&', "&amp;") // replaces &
		.replaceAll('<', "&lt;") // replaces <
		.replaceAll('>', "&gt;") // replaces >
		.replaceAll('"', "&quot;") // replaces "
		.replaceAll("'", "&#39;") // replaces '

		// md

		.replaceAll(/\|\|(.+?)\|\|/g, '$1') // removes ||spoiler||
		.replaceAll(/__(.+?)__/g, '$1') // removes __underline__
		.replaceAll(/\*\*(.+?)\*\*/g, '$1') // removes **bold**
		.replaceAll(/\*(.+?)\*/g, '$1') // removes *italics*
		.replaceAll(/~~(.+?)~~/g, '$1') // removes ~~strikethrough~~
		.replaceAll(/\^(.+?)\^/g, '$1') // removes ^quote^
		.replaceAll(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // removes `inline code` and ```code blocks```
		.replaceAll(/^#+\s*/gm, '') // removes markdown headers like #, ##, etc
		.replace(/!\[(.*?)\]\(.*?\)/g, '$1') // replaces ![alt text](url) with alt text
		.replaceAll(/\[(.+?)\]\(.*?\)/g, '$1'); // replaces [text](url) with text
}

export function formatDate(date: Date): string {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	const parts = formatter.formatToParts(date);
	const map: Record<string, string> = {};
	parts.forEach(({ type, value }) => {
		map[type] = value;
	});

	return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`;
}

export function getUserProps(profile: Profile) {
	const title = createName(profile.displayName, profile.username);
	const image = profile.media.avatar.data.large || profile.media.avatar.data.medium || profile.media.avatar.data.thumbnail;
	const banner = profile.media.banner.data.large || profile.media.banner.data.medium || profile.media.banner.data.thumbnail;

	return {
		title, image: {
			url: image,
			data: profile.media.avatar
		}, banner: {
			url: banner,
			data: profile.media.banner
		}
	};
}

export function getDescription(tags: string, content: string) {
	const cutoff = EmbedCutoff - tags.length;
	const demarkedContent = clean(content);
	const formattedContent = (demarkedContent.length > cutoff ? demarkedContent.slice(0, cutoff) + "..." : demarkedContent)
		.split("\n")
		.slice(0, EmbedLineCutoff)
		.join("\n"); // todo maybe make this more efficient
	return `${formattedContent}\n\n${tags}`;
}

export function createName(display: string, username: string) {
	return clean(
		display === username ? `@${username}` : `${display} (@${username})`
	)
}