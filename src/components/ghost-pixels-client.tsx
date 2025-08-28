

"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import {
  FileImage,
  KeyRound,
  Lock,
  Unlock,
  Download,
  Trash2,
  BrainCircuit,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AiOptimizerDialog, type RecommendedSettings } from "@/components/ai-optimizer-dialog";

// --- START: Inlined crypto.ts ---
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

async function encryptMessage(message: string, password: string): Promise<string> {
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

async function decryptMessage(encryptedBase64: string, password: string): Promise<string> {
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
// --- END: Inlined crypto.ts ---


// --- START: Inlined steganography.ts ---
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

const checkCapacity = (width: number, height: number, bitDepth: number, channel: string, message: string): boolean => {
    const binaryMessage = textToBinary(message) + DELIMITER;
    const requiredCapacity = binaryMessage.length;
    const channelCount = channel === 'RGB' ? 3 : 1;
    const availableCapacity = width * height * channelCount * bitDepth;
    return requiredCapacity <= availableCapacity;
}

const encodeMessage = (
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

const decodeMessage = (
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
// --- END: Inlined steganography.ts ---

type StegoChannel = "RGB" | "R" | "G" | "B";

export function GhostPixelsClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("encode");

  // Common state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Encode state
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [encodedImageUrl, setEncodedImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [bitDepth, setBitDepth] = useState(1);
  const [channel, setChannel] = useState<StegoChannel>("RGB");
  const [isAiOptimizerOpen, setIsAiOptimizerOpen] = useState(false);

  // Decode state
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [stegoImageUrl, setStegoImageUrl] = useState<string | null>(null);
  const [decodedMessage, setDecodedMessage] = useState("");

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const encodedCanvasRef = useRef<HTMLCanvasElement>(null);
  const stegoCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
      if (encodedImageUrl) URL.revokeObjectURL(encodedImageUrl);
      if (stegoImageUrl) URL.revokeObjectURL(stegoImageUrl);
    };
  }, [originalImageUrl, encodedImageUrl, stegoImageUrl]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, type: "original" | "stego") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "original") {
      setOriginalImage(file);
      if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEncodedImageUrl(null);
    } else {
      setStegoImage(file);
      if (stegoImageUrl) URL.revokeObjectURL(stegoImageUrl);
      setStegoImageUrl(URL.createObjectURL(file));
      setDecodedMessage("");
    }
  };
  
  const resetState = (tab: "encode" | "decode") => {
    setIsLoading(false);
    setPassword("");
    setShowPassword(false);
    if(tab === 'encode') {
      setOriginalImage(null);
      if(originalImageUrl) URL.revokeObjectURL(originalImageUrl);
      setOriginalImageUrl(null);
      if(encodedImageUrl) URL.revokeObjectURL(encodedImageUrl);
      setEncodedImageUrl(null);
      setMessage('');
      setBitDepth(1);
      setChannel('RGB');
    } else {
      setStegoImage(null);
      if(stegoImageUrl) URL.revokeObjectURL(stegoImageUrl);
      setStegoImageUrl(null);
      setDecodedMessage('');
    }
  };

  const handleEncode = async () => {
    if (!originalImage || !message || !password) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please provide an image, a message, and a password." });
      return;
    }

    setIsLoading(true);
    try {
      const encryptedMessage = await encryptMessage(message, password);
      
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = encodedCanvasRef.current;
        if (!canvas) {
            setIsLoading(false);
            return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if(!ctx) {
          setIsLoading(false);
          return;
        }
        
        ctx.drawImage(img, 0, 0);

        if(!checkCapacity(img.width, img.height, bitDepth, channel, encryptedMessage)){
          toast({ variant: "destructive", title: "Capacity Exceeded", description: "Message is too large for the selected image and settings. Try a larger image, or increase bit depth." });
          setIsLoading(false);
          return;
        }

        encodeMessage(ctx, img.width, img.height, encryptedMessage, bitDepth, channel);
        setEncodedImageUrl(canvas.toDataURL("image/png"));

        toast({ title: "Success", description: "Message encoded successfully." });
      };
      img.src = originalImageUrl!;

    } catch (error) {
      console.error("Encoding error:", error);
      toast({ variant: "destructive", title: "Encoding Failed", description: "An error occurred during encoding. Check console for details." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!stegoImage || !password) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please provide an image and a password." });
      return;
    }
    setIsLoading(true);
    setDecodedMessage("");

    const img = document.createElement('img');
    img.onload = async () => {
      const canvas = stegoCanvasRef.current;
      if (!canvas) {
          setIsLoading(false);
          return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if(!ctx) {
        setIsLoading(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const extractedMessage = decodeMessage(ctx, img.width, img.height, bitDepth, channel);
        if (!extractedMessage) {
            throw new Error("No message found or extraction failed.");
        }
        const decryptedMessage = await decryptMessage(extractedMessage, password);
        setDecodedMessage(decryptedMessage);
        toast({ title: "Success", description: "Message decoded successfully." });
      } catch (error) {
        console.error("Decoding error:", error);
        toast({ variant: "destructive", title: "Decoding Failed", description: "Could not decode message. Check password, settings, or if the image contains a message." });
      } finally {
        setIsLoading(false);
      }
    };
    img.src = stegoImageUrl!;
  };

  const applyAiSettings = (settings: RecommendedSettings) => {
    setBitDepth(settings.recommendedBitDepth);
    setChannel(settings.recommendedColorChannel as StegoChannel);
    toast({ title: "AI Settings Applied", description: settings.rationale });
  };
  
  const PasswordInput = ({id}: {id: string}) => (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Your secret password"
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 h-full px-3"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">
            <Lock className="mr-2 h-4 w-4" /> Encode
          </TabsTrigger>
          <TabsTrigger value="decode">
            <Unlock className="mr-2 h-4 w-4" /> Decode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileImage /> 1. Select Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input id="image-upload" type="file" accept="image/png, image/jpeg" onChange={(e) => handleImageChange(e, 'original')} />
                  {originalImageUrl && <div className="mt-4 rounded-lg overflow-hidden border"><Image src={originalImageUrl} alt="Original" width={400} height={400} className="w-full h-auto object-contain" /></div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><KeyRound /> 2. Set Secret Message & Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your secret message here." />
                  </div>
                  <div>
                    <Label htmlFor="password-encode">Password</Label>
                    <PasswordInput id="password-encode" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2"><BrainCircuit /> 3. Configure Settings</CardTitle>
                            <CardDescription>Fine-tune how data is hidden.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsAiOptimizerOpen(true)}><BrainCircuit className="mr-2 h-4 w-4" /> AI Optimizer</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label>Bit Depth: {bitDepth}</Label>
                        <Slider value={[bitDepth]} onValueChange={(value) => setBitDepth(value[0])} min={1} max={8} step={1} />
                        <p className="text-sm text-muted-foreground">Higher values store more data but may create visible noise.</p>
                    </div>
                    <div>
                        <Label>Color Channel</Label>
                        <Select value={channel} onValueChange={(value: StegoChannel) => setChannel(value)}>
                            <SelectTrigger><SelectValue placeholder="Select a channel" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RGB">All (RGB)</SelectItem>
                                <SelectItem value="R">Red</SelectItem>
                                <SelectItem value="G">Green</SelectItem>
                                <SelectItem value="B">Blue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-4">
                <Button onClick={handleEncode} disabled={isLoading} className="flex-1 min-w-[150px]">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Encode Message
                </Button>
                <Button variant="destructive" onClick={() => resetState('encode')} className="flex-1 min-w-[150px]">
                    <Trash2 className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>

            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comparison</CardTitle>
                  <CardDescription>Original vs. Encoded Image</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-center">Original</h3>
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                           {originalImageUrl ? <Image src={originalImageUrl} alt="Original" width={400} height={400} className="w-full h-auto object-contain" /> : <FileImage className="w-16 h-16 text-muted-foreground" />}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 text-center">Encoded</h3>
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          <canvas ref={encodedCanvasRef} className="hidden" />
                           {encodedImageUrl ? <Image src={encodedImageUrl} alt="Encoded" width={400} height={400} className="w-full h-auto object-contain" /> : <FileImage className="w-16 h-16 text-muted-foreground" />}
                        </div>
                    </div>
                </CardContent>
              </Card>
              {encodedImageUrl && (
                 <a href={encodedImageUrl} download="encoded-image.png">
                    <Button variant="secondary" className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Download Encoded Image
                    </Button>
                </a>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decode" className="mt-6">
            <div className="max-w-xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileImage/> 1. Upload Stego-Image</CardTitle>
                        <CardDescription>Select the image containing the hidden message.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input id="stego-image-upload" type="file" accept="image/png" onChange={(e) => handleImageChange(e, 'stego')} />
                        <canvas ref={stegoCanvasRef} className="hidden" />
                        {stegoImageUrl && <div className="mt-4 rounded-lg overflow-hidden border"><Image src={stegoImageUrl} alt="Steganography Image" width={400} height={400} className="w-full h-auto object-contain" /></div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound/> 2. Enter Password</CardTitle>
                        <CardDescription>The password used during encoding.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="password-decode">Password</Label>
                            <PasswordInput id="password-decode"/>
                        </div>
                         <div>
                            <Label>Bit Depth: {bitDepth}</Label>
                            <Slider value={[bitDepth]} onValueChange={(value) => setBitDepth(value[0])} min={1} max={8} step={1} />
                        </div>
                        <div>
                            <Label>Color Channel</Label>
                            <Select value={channel} onValueChange={(value: StegoChannel) => setChannel(value)}>
                                <SelectTrigger><SelectValue placeholder="Select a channel" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RGB">All (RGB)</SelectItem>
                                    <SelectItem value="R">Red</SelectItem>
                                    <SelectItem value="G">Green</SelectItem>
                                    <SelectItem value="B">Blue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                 <div className="flex flex-wrap gap-4">
                    <Button onClick={handleDecode} disabled={isLoading} className="flex-1 min-w-[150px]">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                        Decode Message
                    </Button>
                    <Button variant="destructive" onClick={() => resetState('decode')} className="flex-1 min-w-[150px]">
                        <Trash2 className="mr-2 h-4 w-4" /> Reset
                    </Button>
                 </div>
                
                 {decodedMessage && (
                    <Card>
                        <CardHeader><CardTitle>Extracted Message</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea value={decodedMessage} readOnly className="font-code h-48 bg-muted/50" />
                        </CardContent>
                    </Card>
                 )}
            </div>
        </TabsContent>
      </Tabs>
      <canvas ref={originalCanvasRef} className="hidden" />
      <AiOptimizerDialog
        isOpen={isAiOptimizerOpen}
        onClose={() => setIsAiOptimizerOpen(false)}
        onApplySettings={applyAiSettings}
        imageDescription={originalImage?.name || 'a generic image'}
        textDescription={message || 'a generic text message'}
      />
    </div>
  );
}
