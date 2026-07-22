import { postAgentCommand } from '../api/client';
import { ToolExecutionResult } from '../types/agentTools';

/**
 * Send an operator command to the Django-owned Sentinel agent. Gemini keys and
 * tool selection remain on the server; this layer only transports UI context.
 */
export const processEngineerCommand = async (
  input: string,
  telemetryContext: any,
): Promise<ToolExecutionResult> => {
  const prompt = input.trim();

  if (!prompt) {
    return {
      message: 'Awaiting command. Specify a **view**, request a **system status**, or issue an authorized **override** or **load shed** instruction.',
    };
  }

  return postAgentCommand(prompt, telemetryContext);
};
