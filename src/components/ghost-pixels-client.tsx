
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
  Settings2,
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
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { encodeMessage, decodeMessage, checkCapacity } from "@/lib/steganography";
import { Meteors } from "./ui/meteors";
import { CardContainer, CardBody, CardItem } from "./ui/3d-card";
import { EvervaultCard } from "./ui/evervault-card";

type StegoChannel = "RGB" | "R" | "G" | "B";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput = ({ id, value, onChange }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="Your secret password"
        className="pr-10 bg-background/50"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};

interface SettingsControlsProps {
  bitDepth: number;
  setBitDepth: (value: number) => void;
  channel: StegoChannel;
  setChannel: (value: StegoChannel) => void;
}

const SettingsControls = ({ bitDepth, setBitDepth, channel, setChannel }: SettingsControlsProps) => {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <Label>Bit Depth: <span className="text-primary font-bold">{bitDepth}</span></Label>
        <Slider value={[bitDepth]} onValueChange={(value) => setBitDepth(value[0])} min={1} max={8} step={1} />
        <p className="text-sm text-muted-foreground mt-2">Higher values store more data but may create visible noise.</p>
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
        <p className="text-sm text-muted-foreground mt-2">Hiding data in a single channel is stealthier.</p>
      </div>
    </div>
  );
};

const ImageBox = ({ src, alt }: { src: string | null; alt: string }) => {
  return (
    <div className="w-full min-h-[300px] lg:min-h-[400px] bg-muted/20 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-border/50 relative">
      {src ? (
        <Image src={src} alt={alt} width={800} height={600} className="w-full h-full object-contain" />
      ) : (
        <FileImage className="w-24 h-24 text-muted-foreground/30" />
      )}
    </div>
  );
};

export function GhostPixelsClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("encode");

  // Common state
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bitDepth, setBitDepth] = useState(1);
  const [channel, setChannel] = useState<StegoChannel>("RGB");

  // Encode state
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [encodedImageUrl, setEncodedImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isAiOptimizerOpen, setIsAiOptimizerOpen] = useState(false);

  // Decode state
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [stegoImageUrl, setStegoImageUrl] = useState<string | null>(null);
  const [decodedMessage, setDecodedMessage]  = useState("");

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
    setBitDepth(1);
    setChannel('RGB');

    if(tab === 'encode') {
      setOriginalImage(null);
      if(originalImageUrl) URL.revokeObjectURL(originalImageUrl);
      setOriginalImageUrl(null);
      if(encodedImageUrl) URL.revokeObjectURL(encodedImageUrl);
      setEncodedImageUrl(null);
      setMessage('');
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
            try {
                const canvas = encodedCanvasRef.current;
                if (!canvas) throw new Error("Canvas element not found.");

                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) throw new Error("Could not get canvas context.");
                
                ctx.drawImage(img, 0, 0);

                if (!checkCapacity(img.width, img.height, bitDepth, channel, encryptedMessage)) {
                    throw new Error("Message is too large for the selected image and settings. Try a larger image, or increase bit depth.");
                }

                encodeMessage(ctx, img.width, img.height, encryptedMessage, bitDepth, channel);

                canvas.toBlob((blob) => {
                    if (blob) {
                        if (encodedImageUrl) URL.revokeObjectURL(encodedImageUrl);
                        setEncodedImageUrl(URL.createObjectURL(blob));
                        toast({ title: "Success!", description: "Message successfully hidden in the image." });
                    } else {
                       throw new Error("Could not generate image from canvas.");
                    }
                }, 'image/png');

            } catch (error) {
                console.error("Encoding error:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during encoding.";
                toast({ variant: "destructive", title: "Encoding Failed", description: errorMessage });
            } finally {
                setIsLoading(false);
            }
        };

        img.onerror = () => {
            setIsLoading(false);
            toast({ variant: "destructive", title: "Image Error", description: "Could not load the image file." });
        };

        img.src = originalImageUrl!;

    } catch (error) {
        console.error("Encryption error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during encryption.";
        toast({ variant: "destructive", title: "Encryption Failed", description: errorMessage });
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
            toast({ variant: "destructive", title: "Error", description: "Canvas element not found." });
            setIsLoading(false);
            return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if(!ctx) {
            toast({ variant: "destructive", title: "Error", description: "Could not get canvas context." });
            setIsLoading(false);
            return;
        }
        ctx.drawImage(img, 0, 0);
        try {
            const extractedMessage = await decodeMessage(ctx, img.width, img.height, bitDepth, channel);
            if (!extractedMessage) {
                throw new Error("No message found or extraction failed.");
            }
            const decryptedMessage = await decryptMessage(extractedMessage, password);
            setDecodedMessage(decryptedMessage);
            toast({ title: "Success!", description: "Secret message has been revealed." });
        } catch (error) {
            console.error("Decoding error:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not decode message. Check password, settings, or if the image contains a message.";
            toast({ variant: "destructive", title: "Decoding Failed", description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    img.onerror = () => {
        setIsLoading(false);
        toast({ variant: "destructive", title: "Image Error", description: "Could not load the image file." });
    };

    img.src = stegoImageUrl!;
  };
  
  const handleDownload = () => {
    if (!encodedImageUrl) return;
    const a = document.createElement('a');
    a.href = encodedImageUrl;
    a.download = 'encoded-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const applyAiSettings = (settings: RecommendedSettings) => {
    setBitDepth(settings.recommendedBitDepth);
    setChannel(settings.recommendedColorChannel as StegoChannel);
    toast({ title: "AI Settings Applied", description: `Rationale: ${settings.rationale}` });
  };
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        resetState(value as "encode" | "decode");
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
          <TabsTrigger value="encode">
            <Lock className="mr-2 h-4 w-4" /> Encode
          </TabsTrigger>
          <TabsTrigger value="decode">
            <Unlock className="mr-2 h-4 w-4" /> Decode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <Card className="bg-card/70 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileImage /> 1. Upload Image</CardTitle>
                  <CardDescription>Select a PNG or JPEG to hide your message in.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input type="file" accept="image/png, image/jpeg" onChange={(e) => handleImageChange(e, 'original')} className="file:text-foreground" />
                </CardContent>
              </Card>

               <Card className="bg-card/70 shadow-lg relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><KeyRound /> 2. Add Secret</CardTitle>
                  <CardDescription>Provide the message and a password to encrypt it.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your secret message here..." className="bg-background/50" />
                  </div>
                  <div>
                    <Label htmlFor="password-encode">Password</Label>
                    <PasswordInput id="password-encode" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </CardContent>
                <Meteors number={10} />
              </Card>

              <Card className="bg-card/70 shadow-lg relative overflow-hidden">
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Settings2 /> 3. Configure</CardTitle>
                            <CardDescription>Fine-tune how the data is hidden.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsAiOptimizerOpen(true)}><BrainCircuit className="mr-2 h-4 w-4" /> AI</Button>
                    </div>
                </CardHeader>
                <CardContent>
                  <SettingsControls bitDepth={bitDepth} setBitDepth={setBitDepth} channel={channel} setChannel={setChannel} />
                </CardContent>
                <Meteors number={10} />
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleEncode} disabled={isLoading} size="lg" className="flex-1 text-lg py-6 shadow-xl shadow-primary/20">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Encode Message
                </Button>
                <Button variant="destructive" onClick={() => resetState('encode')} className="flex-1 text-lg py-6" size="lg">
                    <Trash2 className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-card/70 shadow-lg">
                <CardHeader>
                  <CardTitle>{encodedImageUrl ? "Encoded Image" : "Original Image"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <canvas ref={encodedCanvasRef} className="hidden" />
                  <CardContainer>
                    <CardBody>
                      <CardItem translateZ="60">
                        <ImageBox src={encodedImageUrl || originalImageUrl} alt={encodedImageUrl ? "Encoded" : "Original"} />
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                  {encodedImageUrl && (
                    <Button onClick={handleDownload} variant="secondary" className="w-full text-md py-5 mt-4">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decode" className="mt-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-6">
                <Card className="bg-card/70 shadow-lg">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><FileImage/> 1. Upload Stego-Image</CardTitle>
                      <CardDescription>Select the PNG image containing the hidden message.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Input type="file" accept="image/png" onChange={(e) => handleImageChange(e, 'stego')} className="file:text-foreground"/>
                      <canvas ref={stegoCanvasRef} className="hidden" />
                  </CardContent>
                </Card>
                <Card className="bg-card/70 shadow-lg relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound/> 2. Enter Password & Settings</CardTitle>
                        <CardDescription>Provide the password and settings used for encoding.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="password-decode">Password</Label>
                            <PasswordInput id="password-decode" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <SettingsControls bitDepth={bitDepth} setBitDepth={setBitDepth} channel={channel} setChannel={setChannel} />
                    </CardContent>
                    <Meteors number={10} />
                </Card>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleDecode} disabled={isLoading} className="flex-1 text-lg py-6 shadow-xl shadow-primary/20" size="lg">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                      Decode Message
                  </Button>
                  <Button variant="destructive" onClick={() => resetState('decode')} className="flex-1 text-lg py-6" size="lg">
                      <Trash2 className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>
                {decodedMessage && (
                  <Card className="shadow-lg bg-card/70">
                    <CardHeader>
                      <CardTitle>Revealed Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full">
                          <EvervaultCard text={decodedMessage} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card className="bg-card/70 shadow-lg">
                  <CardHeader>
                    <CardTitle>Image to Decode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardContainer>
                        <CardBody>
                            <CardItem translateZ="60">
                                <ImageBox src={stegoImageUrl} alt="Steganography Image" />
                            </CardItem>
                        </CardBody>
                    </CardContainer>
                  </CardContent>
                </Card>
              </div>
           </div>
        </TabsContent>
      </Tabs>
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
