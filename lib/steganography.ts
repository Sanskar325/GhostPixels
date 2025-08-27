"use client";

const DELIMITER = "001100010011010100111001001100100011010100110111"; // "159257" in binary, unlikely sequence

function textToBinary(text: string): string {
  return text.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');
}

function binaryToText(binary: string): string {
  if (binary.length % 8 !== 0) {
    console.error("Binary string length is not a multiple of 8");
    // Trim to the nearest multiple of 8
    binary = binary.substring(0, binary.length - (binary.length % 8));
  }
  
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
}

export const checkCapacity = (width: number, height: number, bitDepth: number, channel: string, message: string): boolean => {
    const binaryMessage = textToBinary(message) + DELIMITER;
    const requiredCapacity = binaryMessage.length;
    const channelCount = channel === 'RGB' ? 3 : 1;
    const availableCapacity = width * height * channelCount * bitDepth;
    return requiredCapacity <= availableCapacity;
}

export const encodeMessage = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  message: string,
  bitDepth: number,
  channel: string
) => {
  const binaryMessage = textToBinary(message) + DELIMITER;
  let messageIndex = 0;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const mask = (255 << bitDepth) & 255;
  
  const channelsToUse = {
    R: [0],
    G: [1],
    B: [2],
    RGB: [0, 1, 2]
  }[channel as 'R' | 'G' | 'B' | 'RGB'] || [0, 1, 2];


  for (let i = 0; i < data.length; i += 4) {
    for(const channelIndex of channelsToUse){
        if (messageIndex < binaryMessage.length) {
            const bitsToHide = binaryMessage.substring(messageIndex, messageIndex + bitDepth);
            const bitsValue = parseInt(bitsToHide, 2);

            data[i + channelIndex] = (data[i + channelIndex] & mask) | bitsValue;
            messageIndex += bitDepth;
        } else {
            break;
        }
    }
    if(messageIndex >= binaryMessage.length) break;
  }

  ctx.putImageData(imageData, 0, 0);
};

export const decodeMessage = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bitDepth: number,
  channel: string
): string => {
  let binaryMessage = '';
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const lsbMask = (1 << bitDepth) - 1;

  const channelsToUse = {
    R: [0],
    G: [1],
    B: [2],
    RGB: [0, 1, 2]
  }[channel as 'R' | 'G' | 'B' | 'RGB'] || [0, 1, 2];

  for (let i = 0; i < data.length; i += 4) {
    for(const channelIndex of channelsToUse){
        const lsb = data[i + channelIndex] & lsbMask;
        binaryMessage += lsb.toString(2).padStart(bitDepth, '0');
    }
    
    const delimiterIndex = binaryMessage.indexOf(DELIMITER);
    if(delimiterIndex !== -1){
        binaryMessage = binaryMessage.substring(0, delimiterIndex);
        return binaryToText(binaryMessage);
    }
  }
  return ""; // Delimiter not found
};
