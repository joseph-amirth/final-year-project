import { readFileSync } from 'fs';

export function get_peers(): string[] {
    const peers_bytes: Buffer = readFileSync('src/peers.txt');
    const peers_text: string = peers_bytes.toString();
    const peers = peers_text.split("\n");
    peers.pop();
    return peers;
}

export const peers: string[] = get_peers();

export const whoami: string = process.env['CORE_PEER_ID'] || '';
