import { Colour } from "./constants";

export const html = (...children: any[]) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <link rel="dns-prefetch" href="https://static.darflen.com" />
                <link rel="preconnect" href="https://static.darflen.com" crossOrigin="" />

                <link rel="icon" type="image/png" sizes="32x32" href="https://static.darflen.com/img/favicons/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="https://static.darflen.com/img/favicons/favicon-16x16.png" />

                <meta name="author" content="darflen(xyz)" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:type" content="website" />
                <meta name="twitter:site" content="@darflen" />
                <meta name="theme-color" content={Colour} />
                <meta name="robots" content="noindex, nofollow" />
                {children}
            </head>
            <body></body>
        </html>
    )
}