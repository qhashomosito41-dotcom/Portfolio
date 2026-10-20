import { Algorithm, hash, verify } from '@node-rs/argon2';

const options = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

export const hashPassword = (password: string): Promise<string> => hash(password, options);

export const verifyPassword = async (passwordHash: string, password: string): Promise<boolean> => {
  try {
    return await verify(passwordHash, password, { algorithm: Algorithm.Argon2id });
  } catch {
    return false;
  }
};

let dummyHashPromise: Promise<string> | null = null;

export const getDummyHash = (): Promise<string> => {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword('timing-equalisation-placeholder');
  }
  return dummyHashPromise;
};
