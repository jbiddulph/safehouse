import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = query.search as string | undefined
  const filter = query.filter as string | undefined

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Check if user is admin (you may want to add proper auth middleware)
    // For now, we'll proceed assuming admin check is done elsewhere

    // First, check if the table exists by trying a simple count query
    const { count, error: countError } = await supabase
      .from('safehouse_nfc_codes')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Table check error:', countError)
      // If table doesn't exist, return empty array with helpful message
      if (countError.code === '42P01' || countError.message?.includes('does not exist')) {
        return {
          success: true,
          nfcCodes: [],
          message: 'NFC codes table does not exist. Please run the database migration first.'
        }
      }
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${countError.message || 'Unknown error'}`
      })
    }

    console.log(`NFC codes table exists with ${count || 0} records`)

    // Supabase has a maximum limit of 1000 records per query
    // We need to fetch all records in batches
    const batchSize = 1000
    let allNfcCodes: any[] = []
    let offset = 0
    let hasMore = true

    // Fetch all records in batches
    while (hasMore) {
      // Create a fresh query for each batch
      let batchQuery = supabase
        .from('safehouse_nfc_codes')
        .select(`
          id,
          code_id,
          created_at,
          updated_at
        `, { count: 'exact' })
        .order('code_id', { ascending: true })
        .range(offset, offset + batchSize - 1)

      // Apply search filter if provided
      if (search && search.trim()) {
        batchQuery = batchQuery.ilike('code_id', `%${search.trim()}%`)
      }
      
      const { data: batchData, error: codesError } = await batchQuery

      if (codesError) {
        console.error('Error fetching NFC codes:', codesError)
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to fetch NFC codes: ${codesError.message || 'Unknown error'}`
        })
      }

      if (batchData && batchData.length > 0) {
        allNfcCodes = allNfcCodes.concat(batchData)
        offset += batchSize
        hasMore = batchData.length === batchSize
      } else {
        hasMore = false
      }
    }

    console.log(`Fetched ${allNfcCodes.length} NFC codes from database`)
    const nfcCodes = allNfcCodes

    // Fetch all property assignments in batches (Supabase .in() has limits)
    const nfcCodeIds = (nfcCodes || []).map((code: any) => code.id)
    let allAssignments: any[] = []
    const assignmentsByCodeId = new Map<string, any[]>()
    
    if (nfcCodeIds.length > 0) {
      // Fetch ALL assignments at once (not in batches by NFC code ID)
      // Since we're fetching by nfc_code_id, we can fetch all assignments in one go
      const { data: assignments, error: assignError } = await supabase
        .from('safehouse_nfc_code_properties')
        .select(`
          id,
          nfc_code_id,
          property_id
        `)

      if (assignError) {
        console.error('Error fetching assignments:', assignError)
      } else {
        allAssignments = assignments || []
        
        // Filter to only assignments for the NFC codes we're interested in
        allAssignments = allAssignments.filter((a: any) => nfcCodeIds.includes(a.nfc_code_id))
      }
      
      // Now fetch property details for all assigned properties
      const propertyIds = [...new Set(allAssignments.map((a: any) => a.property_id))]
      const propertiesMap = new Map<string, any>()
      
      if (propertyIds.length > 0) {
        // Fetch properties in batches
        const propertyBatchSize = 1000
        let propertyOffset = 0
        let hasMoreProperties = true
        
        while (hasMoreProperties && propertyOffset < propertyIds.length) {
          const batchPropertyIds = propertyIds.slice(propertyOffset, propertyOffset + propertyBatchSize)
          
          const { data: properties, error: propError } = await supabase
            .from('safehouse_properties')
            .select('id, property_name, address')
            .in('id', batchPropertyIds)
          
          if (propError) {
            console.warn('Error fetching properties batch:', propError)
            hasMoreProperties = false
          } else if (properties && properties.length > 0) {
            properties.forEach((prop: any) => {
              propertiesMap.set(prop.id, prop)
            })
            propertyOffset += propertyBatchSize
            hasMoreProperties = properties.length === propertyBatchSize && propertyOffset < propertyIds.length
          } else {
            hasMoreProperties = false
          }
        }
      }
      
      // Group assignments by NFC code ID with property details
      allAssignments.forEach((assignment: any) => {
        const codeId = assignment.nfc_code_id
        const property = propertiesMap.get(assignment.property_id)
        
        if (property) {
          if (!assignmentsByCodeId.has(codeId)) {
            assignmentsByCodeId.set(codeId, [])
          }
          assignmentsByCodeId.get(codeId)!.push({
            id: property.id,
            property_name: property.property_name,
            address: property.address
          })
        }
      })
    }

    // Combine NFC codes with their property assignments
    const codesWithProperties = (nfcCodes || []).map((code: any) => {
      // Extract numeric part for sorting (e.g., "26-123" -> 123)
      const numericPart = parseInt(code.code_id.split('-')[1] || '0', 10)
      const properties = assignmentsByCodeId.get(code.id) || []
      
      return {
        id: code.id,
        code_id: code.code_id,
        numericPart: numericPart, // Add numeric part for sorting
        created_at: code.created_at,
        updated_at: code.updated_at,
        properties: properties
      }
    })

    // Sort numerically by the numeric part after "26-"
    codesWithProperties.sort((a: any, b: any) => {
      return a.numericPart - b.numericPart
    })

    // Remove the temporary numericPart field before returning
    const cleanedCodes = codesWithProperties.map((code: any) => {
      const { numericPart, ...rest } = code
      return rest
    })

    // Apply assignment filter
    let filteredCodes = cleanedCodes
    if (filter === 'assigned') {
      filteredCodes = cleanedCodes.filter((code: any) => code.properties && code.properties.length > 0)
    } else if (filter === 'unassigned') {
      filteredCodes = cleanedCodes.filter((code: any) => !code.properties || code.properties.length === 0)
    }

    return {
      success: true,
      nfcCodes: filteredCodes
    }
  } catch (error: any) {
    console.error('Error in NFC codes API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch NFC codes'
    })
  }
})
