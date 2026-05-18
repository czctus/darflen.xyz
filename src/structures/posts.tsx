import mime from 'mime-types';

import { Icons } from "../constants";
import { html } from "../html";
import { formatDate, getDescription, getUserProps } from "../utils";

import type { Create } from "../types";

export const create: Create = (hono, darflen) => {
    hono.get('/posts/:id', async (c) => {
        const id = c.req.param('id');
        const post = await darflen.posts.get(id).catch(() => null);

        if (!post) return c.text('no such post with that id', 404);

        const date = post.createdAt;
        const humanDate = formatDate(date);

        const tag = `${post.stats.loves} ❤️ | ${post.stats.comments} 💬`;

        const user = getUserProps(post.author);
        const title = `${user.title}${post.pinned ? ` ${Icons.Pinned}` : ""}${post.locked ? ` ${Icons.Locked}` : ""}`
        const userIcon = user.image;
        const description = getDescription(tag, `${post.content}${post.poll ?
            `\n${post.poll.choices.map(choice => `\n[ ${choice.text} ] (${choice.votes})`).join("")}` : ""}`);

        const firstFile = post.media[0];
        const link = (firstFile && firstFile.isImage()) ? (
            firstFile.data.large ||
            firstFile.data.medium ||
            firstFile.data.thumbnail
        ) : (firstFile && firstFile.isVideo()) ? (
            firstFile.data.file ||
            firstFile.data.thumbnail
        ) : null;
        const mimeType = link ? mime.lookup(link.split(".").pop() || "") : null;

        const iconFragment = [
            <meta property='og:type' content = "article" />,
            <meta property='og:image' content = {userIcon} />,
            <meta property='og:image:secure_url' content = {userIcon} />,
        ]
        const mediaFragment = link ? (
            firstFile.isImage() ?
                [
                    <meta property='og:image' content = {link} />,
                    <meta property='og:image:secure_url' content = {link} />,
                    <meta property='og:type' content = "article" />,
                ] : firstFile.isVideo() ?
                    [
                        <meta property='og:type' content="video.other" />,
                        <meta property='og:video:url' content={link} />,
                        <meta property='og:video:secure_url' content={link} />,
                        //`<meta property='og:video:type' content={mimeType} />`,
                    ] : iconFragment
        ) : iconFragment;

        return c.html(html(
            <meta name="description" content={description} />,

            <meta property="og:title" content={title} />,
            <meta property="og:site_name" content={`Darflen • ${humanDate}`} />,
            <meta property="og:description" content={description} />,
            <meta property="og:url" content={`https://darflen.com/posts/${post.id}`} />,

            <meta name="twitter:card" content={mimeType && mimeType.startsWith("image/") ? "summary_large_image" : "player"} />,
            <meta name="twitter:title" content={title} />,
            <meta name="twitter:description" content={description} />,
            <meta name="twitter:url" content={`https://darflen.com/posts/${post.id}`} />,

            ...mediaFragment,

            <meta property="article:published_time" content={date.toISOString()} />
        ))
    });
}