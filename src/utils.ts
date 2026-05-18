import { DarflenClient } from "darflen.ts";
import { Colour } from "./constants.js";

export const darflen = new DarflenClient();

export function clean(str: string) {
	return str
		.replaceAll('&', "&amp;") // replaces &
		.replaceAll('<', "&lt;") // replaces <
		.replaceAll('>', "&gt;") // replaces >
		.replaceAll('"', "&quot;") // replaces "
		.replaceAll("'", "&#39;") // replaces '
		.replaceAll(/\*\*(.+?)\*\*/g, '$1') // removes **bold**
		.replaceAll(/\*(.+?)\*/g, '$1') // removes *italics*
		.replaceAll(/~~(.+?)~~/g, '$1') // removes ~~strikethrough~~
		.replaceAll(/`(.+?)`/g, '$1') // removes `inline code`
		.replaceAll(/```[\s\S]*?```/g, '') // removes ```code blocks```
		.replaceAll(/^-?#+\s*/gm, '') // removes markdown headers like #, ##, -#, -## (with or without space)
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

export function createName(display: string, username: string) {
	return clean(
		display === username ? `@${username}` : `${display} (@${username})`
	)
}