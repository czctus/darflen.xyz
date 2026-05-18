import { Profile } from "darflen.ts";

import { getDescription, getUserProps } from "../utils";
import {  Icons } from "../constants";
import { html } from "../html";

import type { Create } from "../types";

export const create: Create = (hono, darflen) => {
    async function createEmbed(profile: Profile) {
        const user = getUserProps(profile);
        const tag = `${profile.stats.followers} ${Icons.Followers} | ${profile.stats.posts} ${Icons.Posts} | ${profile.stats.loves} ${Icons.Loves}`;
        const description = getDescription(tag, profile.description);
        const title = user.title;
        const userIcon = user.image;

        const mediaFragment = [
            <meta property='og:image' content={userIcon} />,
            <meta property='og:image:secure_url' content={userIcon} />,
            <meta property='og:type' content="profile" />,
            <meta property='profile:username' content={profile.username} />,
            <meta property='profile:display_name' content={profile.displayName} />,
        ];

        return html([
            <meta name="description" content={description} />,

            <meta property="og:title" content={title} />,
            <meta property="og:site_name" content="Darflen" />,
            <meta property="og:description" content={description} />,
            <meta property="og:url" content={`https://darflen.com/users/$${profile.id}`} />, // using $id format

            ...mediaFragment,

            <meta name="twitter:card" content="summary" />,
            <meta name="twitter:title" content={title} />,
            <meta name="twitter:description" content={description} />,
            <meta name="twitter:url" content={`https://darflen.com/users/$${profile.id}`} />, // using $id format
        ]);
    }

    hono.get('/users/:username', async (c) => {
        const username = c.req.param('username');
        const profile = await darflen.users.get(username, true).catch(() => null);

        if (!profile) return c.text('no such user with that username', 404);

        return c.html(createEmbed(profile));
    });

    hono.get('/users/$:id', async (c) => {
        const id = c.req.param('id') as string; // oddly, typescript somehow thinks `$` means its optional..?
        const profile = await darflen.users.get(id).catch(() => null);

        if (!profile) return c.text('no such user with that id', 404);

        return c.html(createEmbed(profile));
    });
}