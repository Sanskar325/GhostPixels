"use client";

async function getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(message: string, password: string): Promise<string> {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(password, salt);
    const enc = new TextEncoder();
    const encodedMessage = enc.encode(message);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encodedMessage
    );

    const encryptedData = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    encryptedData.set(salt, 0);
    encryptedData.set(iv, salt.length);
    encryptedData.set(new Uint8Array(ciphertext), salt.length + iv.length);

    // Convert Uint8Array to a string of characters and then to base64
    const charString = String.fromCharCode.apply(null, Array.from(encryptedData));
    return btoa(charString);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Encryption failed. Please check the password and try again.');
  }
}

export async function decryptMessage(encryptedBase64: string, password: string): Promise<string> {
  try {
    const binaryString = atob(encryptedBase64);
    const encryptedData = new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i));
    
    if (encryptedData.length < 28) { // 16 for salt + 12 for IV
      throw new Error("Invalid encrypted data format.");
    }
    
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const ciphertext = encryptedData.slice(28);

    const key = await getKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed. Please check the password and that the data is correct.');
  }
}
