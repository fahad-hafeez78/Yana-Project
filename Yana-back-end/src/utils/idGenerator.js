import { customAlphabet } from 'nanoid';

export const generateNumericId = customAlphabet('0123456789', 5);
