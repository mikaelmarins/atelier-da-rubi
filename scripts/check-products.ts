
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts() {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Error checking products:', error)
    } else {
        console.log(`Total products in DB: ${count}`)
    }
}

checkProducts()
