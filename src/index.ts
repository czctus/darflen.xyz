import { UAParser } from "ua-parser-js";
import { Hono } from 'hono'
import { DarflenClient } from 'darflen.ts';

import { structures } from './structures';

const app = new Hono()
const darflen = new DarflenClient();

app.use('*', async (c, next) => {
    const ua = new UAParser(c.req.header("User-Agent") || "");

    if (ua.getBrowser().name) {
        const path = c.req.path;
        const darflenUrl = `https://darflen.com${path}`;
        
        if (path === "/") {
            return c.redirect("https://github.com/czctus/darflen.xyz");
        } else return c.redirect(darflenUrl);
    }

    c.header("vary", "User-Agent");

    await next();
});

structures.forEach((s) => s.create(app, darflen));

export default app
