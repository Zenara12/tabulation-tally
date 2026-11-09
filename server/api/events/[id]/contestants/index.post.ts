import { z } from 'zod'
import { getSupabaseStorage, getSupabaseStorageBucket } from '../../../../utils/supabase-storage'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const bodySchema = z.object({
  name: z.string().min(1),
  alias: z.string().optional(),
  characterName: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!

  const contentType = getRequestHeader(event, 'content-type') || ''
  let data: z.infer<typeof bodySchema>
  let imagePart: { data: Buffer; type?: string } | undefined

  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    const fields: Record<string, string> = {}

    for (const part of parts || []) {
      if (!part.name) continue
      if (part.name === 'image') {
        imagePart = part as typeof imagePart
      } else {
        fields[part.name] = part.data.toString('utf8')
      }
    }

    data = bodySchema.parse(fields)
  } else {
    data = await readValidatedBody(event, bodySchema.parse)
  }

  let imageUrl: string | null = null
  let uploadedImagePath: string | null = null

  if (imagePart) {
    if (imagePart.type !== 'image/webp') {
      throw createError({ statusCode: 415, statusMessage: 'Contestant image must be a WebP file' })
    }

    if (!imagePart.data.length || imagePart.data.length >= MAX_IMAGE_BYTES) {
      throw createError({ statusCode: 413, statusMessage: 'Contestant image must be under 2 MB' })
    }

    uploadedImagePath = `contestants/${eventId}/${crypto.randomUUID()}.webp`
    const storage = getSupabaseStorage()
    const bucket = getSupabaseStorageBucket()
    const { error: uploadError } = await storage.storage.from(bucket).upload(uploadedImagePath, imagePart.data, {
      cacheControl: '31536000',
      contentType: 'image/webp',
      upsert: false,
    })

    if (uploadError) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to upload contestant image' })
    }

    imageUrl = storage.storage.from(bucket).getPublicUrl(uploadedImagePath).data.publicUrl
  }

  // Auto-increment: find the current max number for this event and add 1
  const last = await prisma.contestant.findFirst({
    where: { eventId },
    orderBy: { number: 'desc' },
    select: { number: true },
  })
  const number = (last?.number ?? 0) + 1

  try {
    return await prisma.contestant.create({
      data: {
        eventId,
        number,
        name: data.name,
        alias: data.alias || null,
        characterName: data.characterName || null,
        cosplayPictureUrl: imageUrl,
      },
    })
  } catch (error) {
    if (uploadedImagePath) {
      const storage = getSupabaseStorage()
      await storage.storage.from(getSupabaseStorageBucket()).remove([uploadedImagePath])
    }
    throw error
  }
})
