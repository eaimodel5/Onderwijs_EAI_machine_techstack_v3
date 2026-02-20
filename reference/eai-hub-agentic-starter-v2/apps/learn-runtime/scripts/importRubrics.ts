import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
)

const files = [
  { code: 'VC', file: 'rubric_VC_structured.json' },
  { code: 'VA', file: 'rubric_VA_structured.json' },
  { code: 'VM', file: 'rubric_VM_structured.json' },
  { code: 'VS', file: 'rubric_VS_structured.json' }
]

async function run() {
  for (const { code, file } of files) {
    const path = `./rubrics/${file}`
    if (!fs.existsSync(path)) {
      console.warn(`Skipping missing rubric file: ${path}`)
      continue
    }
    const rubric_json = JSON.parse(fs.readFileSync(path, 'utf-8'))
    await supabase.from('rubrics').upsert({ code, rubric_json })
  }
}

run()
