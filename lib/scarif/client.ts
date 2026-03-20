import { createClient } from '@scarif/scarif-js';

export function createScarifClient() {
    return createClient({
        apiKey: process.env.NEXT_PUBLIC_MY_API_KEY!
    })
}