// Mock AI configuration for development
export const ai = {
  definePrompt: ({ name, input, output, prompt }: any) => ({
    name,
    input,
    output,
    prompt,
  }),
  defineFlow: ({ name, inputSchema, outputSchema }: any, handler: any) => ({
    name,
    inputSchema,
    outputSchema,
    handler,
  }),
};
