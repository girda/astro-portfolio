import { buildN8nInstructions } from '../apps/assistant-api/n8n-knowledge.mjs';

// Выводится только публичная база знаний; ключи и credentials здесь не читаются.
process.stdout.write(buildN8nInstructions());
