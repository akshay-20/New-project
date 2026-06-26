import type { AIProvider } from '@engineering-copilot/types'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'

/**
 * Returns a Vercel AI SDK LanguageModel for the given provider + model string.
 *
 * Adding a new provider:
 * 1. Install the @ai-sdk/<provider> package
 * 2. Add a case here
 * 3. That's it — all phases and generators use this function automatically
 */
export function getProvider(provider: AIProvider, model: string): LanguageModel {
  switch (provider) {
    case 'anthropic': {
      const anthropic = createAnthropic({
        apiKey: process.env['ANTHROPIC_API_KEY'],
      })
      return anthropic(model)
    }

    case 'openai': {
      const openai = createOpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
      })
      return openai(model)
    }

    case 'google': {
      const google = createGoogleGenerativeAI({
        apiKey: process.env['GOOGLE_GENERATIVE_AI_API_KEY'],
      })
      return google(model)
    }

    case 'ollama': {
      // Ollama is OpenAI-compatible — point at local endpoint
      const ollama = createOpenAI({
        baseURL: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434/v1',
        apiKey: 'ollama', // required but ignored
      })
      return ollama(model)
    }

    default: {
      const _exhaustive: never = provider
      throw new Error(`Unknown AI provider: ${String(_exhaustive)}`)
    }
  }
}

/** Default models per provider */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-opus-4-5',
  openai: 'gpt-4o',
  google: 'gemini-1.5-pro',
  ollama: 'llama3',
}
