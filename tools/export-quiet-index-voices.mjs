import { writeFileSync } from 'node:fs'
import { quietIndexVoiceLines } from '../src/content/quietIndex.ts'

const quote = (value) => `"${value.replaceAll('"', '""')}"`
const rows = [...quietIndexVoiceLines].sort((a, b) => a.id.localeCompare(b.id))
writeFileSync(
  new URL('../docs/quiet-index/VOICE_RECORDING_PLAN.csv', import.meta.url),
  [
    'dialogue_id,speaker,text,status',
    ...rows.map((line) => [line.id, line.speaker, line.text, 'unrecorded'].map(quote).join(',')),
  ].join('\n') + '\n',
)
console.log(`Exported ${rows.length} unrecorded passages. No audio generated.`)
