const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

const buf2hex = (buf: ArrayBuffer | Uint8Array) =>
	Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

const importKey = (password: string) => crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);

export const hashPassword = async (password: string): Promise<string> => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const saltHex = buf2hex(salt);
	const key = await importKey(password);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: salt.buffer, iterations: ITERATIONS, hash: 'SHA-256' },
		key,
		KEY_LENGTH * 8,
	);
	return `${saltHex}:${buf2hex(derived)}`;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
	const [saltHex, storedHash] = hash.split(':');
	if (!saltHex || !storedHash) return false;
	const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
	const key = await importKey(password);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: salt.buffer, iterations: ITERATIONS, hash: 'SHA-256' },
		key,
		KEY_LENGTH * 8,
	);
	return buf2hex(derived) === storedHash;
};
