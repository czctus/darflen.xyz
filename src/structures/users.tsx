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
        const userIcon = user.image.url;

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

    async function getProfile(id: string) {
        const isId = id.startsWith('$');
        return await darflen.users.get(isId ? id.slice(1) : id, !isId).catch(() => null);
    }

    hono.get('/users/:id', async (c) => {
        const id = c.req.param('id');
        const profile = await getProfile(id);
    
        if (!profile) return c.text(`no such user with that ${id.startsWith('$') ? 'id' : 'username'}`, 404);
    
        return c.html(createEmbed(profile));
    });
    
    hono.get("/users/:id/pfp", async (c) => {
        const profile = await getProfile(c.req.param('id'));
        if (!profile) return c.text('no such user', 404);
    
        const user = getUserProps(profile);
        const userIcon = await user.image.data.fetch();

        return c.body(userIcon, 200, {
            "Content-Type": userIcon.type,
            "Cache-Control": "public, max-age=31536000, immutable"
        });
    });
    
    hono.get("/users/:id/banner", async (c) => {
        const profile = await getProfile(c.req.param('id'));
        if (!profile) return c.text('no such user', 404);
    
        const user = getUserProps(profile);
        const banner = await user.banner.data.fetch();
    
        return c.body(banner.stream(), 200, {
            "Content-Type": banner.type,
            "Cache-Control": "public, max-age=31536000, immutable"
        });
    });
}