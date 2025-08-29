'use server';

/**
 * @fileOverview Recommends optimal steganography settings based on the input text, image, and use case.
 *
 * - optimizeSteganographySettings - A function that handles the optimization process.
 * - OptimizeSteganographySettingsInput - The input type for the optimizeSteganographySettings function.
 * - OptimizeSteganographySettingsOutput - The return type for the optimizeSteganographySettings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeSteganographySettingsInputSchema = z.object({
  textDescription: z.string().describe('Description of the text file content.'),
  imageDescription: z.string().describe('Description of the image file.'),
  useCase: z.string().describe('Intended use case for the steganography (e.g., archiving, covert communication).'),
});
export type OptimizeSteganographySettingsInput = z.infer<typeof OptimizeSteganographySettingsInputSchema>;

const OptimizeSteganographySettingsOutputSchema = z.object({
  recommendedBitDepth: z.number().describe('Recommended bit depth for steganography (e.g., 1, 2, 4).'),
  recommendedColorChannel: z.string().describe('Recommended color channel to use (e.g., R, G, B).'),
  rationale: z.string().describe('Explanation of why these settings are recommended.'),
});
export type OptimizeSteganographySettingsOutput = z.infer<typeof OptimizeSteganographySettingsOutputSchema>;

export async function optimizeSteganographySettings(input: OptimizeSteganographySettingsInput): Promise<OptimizeSteganographySettingsOutput> {
  return optimizeSteganographySettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeSteganographySettingsPrompt',
  input: {schema: OptimizeSteganographySettingsInputSchema},
  output: {schema: OptimizeSteganographySettingsOutputSchema},
  prompt: `You are an expert in steganography settings. Based on the following information, recommend the optimal steganography settings to maximize message capacity and minimize visual artifacts.

Text description: {{{textDescription}}}
Image description: {{{imageDescription}}}
Use case: {{{useCase}}}

Considerations:
*   Bit depth: Higher bit depth allows for larger messages but increases the risk of visual artifacts.
*   Color channel: Different color channels have different sensitivities to changes. Some channels might be better for hiding data than others.
*   Use case: The intended use case affects the tolerance for visual artifacts. Covert communication requires minimal artifacts, while archiving might allow for more noticeable changes.

Output the settings in JSON format.
`,
});

const optimizeSteganographySettingsFlow = ai.defineFlow(
  {
    name: 'optimizeSteganographySettingsFlow',
    inputSchema: OptimizeSteganographySettingsInputSchema,
    outputSchema: OptimizeSteganographySettingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
