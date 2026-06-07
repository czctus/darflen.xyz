import mime from 'mime-types';

import { Icons } from "../constants";
import { html } from "../html";
import { formatDate, getDescription, getUserProps } from "../utils";

import type { Create } from "../types";

export const create: Create = (hono, darflen) => {
    async function getPostData(id: string) {
        return await darflen.posts.get(id).then((post) => {
            const date = post.createdAt;
            const humanDate = formatDate(date);

            const user = getUserProps(post.author);
            const userIcon = user.image;

            const firstFile = post.media[0];
            const fileLink = (firstFile && firstFile.isImage()) ? (
                firstFile.data.large ||
                firstFile.data.medium ||
                firstFile.data.thumbnail
            ) : (firstFile && firstFile.isVideo()) ? (
                firstFile.data.file ||
                firstFile.data.thumbnail
            ) : null;
            const mimeType = fileLink ? mime.lookup(fileLink.split(".").pop() || "") : null;

            const title = `${user.title}${post.pinned ? ` ${Icons.Pinned}` : ""}${post.locked ? ` ${Icons.Locked}` : ""}`
            const tag = `${post.stats.loves} ${Icons.Loves} | ${post.stats.comments} ${Icons.Comments}`;
            const description = getDescription(tag, `${post.content}${post.poll ?
                `\n${post.poll.choices.map(choice => `\n[ ${choice.text} ] (${choice.votes})`).join("")}` : ""}`);

            return {
                id: post.id,
                date: {
                    raw: date,
                    human: humanDate,
                },
                media: {
                    icon: userIcon,
                    file: firstFile ? {
                        link: fileLink!,
                        type: mimeType!,
                        object: firstFile!,
                    } : null
                },
                text: {
                    title,
                    description
                }
            }
        }).catch(() => null)
    }

    hono.get('/posts/:id', async (c) => {
        const id = c.req.param('id');
        const post = await getPostData(id);

        if (!post) return c.text('no such post with that id', 404);

        const firstFile = post.media.file;

        const iconFragment = [
            <meta property='og:type' content="article" />,
            <meta property='og:image' content={post.media.icon} />,
            <meta property='og:image:secure_url' content={post.media.icon} />,
        ]
        const mediaFragment = firstFile ? (
            firstFile.object.isImage() ?
                [
                    <meta property='og:image' content={firstFile.link} />,
                    <meta property='og:image:secure_url' content={firstFile.link} />,
                    <meta property='og:type' content="article" />,
                ] : firstFile.object.isVideo() ?
                    [
                        <meta property='og:type' content="video.other" />,
                        <meta property='og:video:url' content={firstFile.link} />,
                        <meta property='og:video:secure_url' content={firstFile.link} />,
                        //`<meta property='og:video:type' content={firstFile.type} />`,
                    ] : iconFragment
        ) : iconFragment;

        return c.html(html(
            <meta name="description" content={post.text.description} />,

            <meta property="og:title" content={post.text.title} />,
            <meta property="og:site_name" content={`Darflen • ${post.date.human}`} />,
            <meta property="og:description" content={post.text.description} />,
            <meta property="og:url" content={`https://darflen.com/posts/${post.id}`} />,

            <meta name="twitter:card" content={firstFile && firstFile.type && firstFile.type.startsWith("image/") ? "summary_large_image" : "player"} />,
            <meta name="twitter:title" content={post.text.title} />,
            <meta name="twitter:description" content={post.text.description} />,
            <meta name="twitter:url" content={`https://darflen.com/posts/${post.id}`} />,

            ...mediaFragment,

            <meta property="article:published_time" content={post.date.raw.toISOString()} />
        ))
    });
}