"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, Loader2, Wand2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { optimizeSteganographySettings, type OptimizeSteganographySettingsOutput } from '@/ai/flows/optimize-steganography-settings';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  imageDescription: z.string().min(1, 'Image description is required.'),
  textDescription: z.string().min(1, 'Text description is required.'),
  useCase: z.string().min(1, 'Use case is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export type RecommendedSettings = OptimizeSteganographySettingsOutput;

interface AiOptimizerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySettings: (settings: RecommendedSettings) => void;
  imageDescription: string;
  textDescription: string;
}

export function AiOptimizerDialog({
  isOpen,
  onClose,
  onApplySettings,
  imageDescription,
  textDescription,
}: AiOptimizerDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendedSettings | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageDescription,
      textDescription,
      useCase: 'Covert communication',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await optimizeSteganographySettings(data);
      setResult(response);
    } catch (error) {
      console.error('AI Optimizer Error:', error);
      toast({
        variant: 'destructive',
        title: 'Optimization Failed',
        description: 'Could not get recommendations from the AI.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySettings = () => {
    if (result) {
      onApplySettings(result);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><BrainCircuit /> AI Settings Optimizer</DialogTitle>
          <DialogDescription>
            Let AI recommend the best settings for your use case to balance capacity and stealth.
          </DialogDescription>
        </DialogHeader>
        
        {!result ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="imageDescription">Image Description</Label>
              <Input id="imageDescription" {...register('imageDescription')} />
              {errors.imageDescription && <p className="text-sm text-destructive mt-1">{errors.imageDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="textDescription">Message Content Description</Label>
              <Textarea id="textDescription" {...register('textDescription')} />
              {errors.textDescription && <p className="text-sm text-destructive mt-1">{errors.textDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="useCase">Primary Use Case</Label>
              <Input id="useCase" {...register('useCase')} />
              {errors.useCase && <p className="text-sm text-destructive mt-1">{errors.useCase.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Get Recommendation
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 space-y-4">
            <h3 className="font-semibold text-lg">Recommendation Result</h3>
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <p><strong>Bit Depth:</strong> {result.recommendedBitDepth}</p>
              <p><strong>Color Channel:</strong> {result.recommendedColorChannel}</p>
              <p><strong>Rationale:</strong> {result.rationale}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResult(null)}>Try Again</Button>
              <Button onClick={handleApplySettings}>Apply Settings</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
