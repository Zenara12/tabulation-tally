import { z } from 'zod'
import { getSupabaseStorage, getSupabaseStorageBucket } from '../../../../utils/supabase-storage'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  alias: z.string().optional(),
  characterName: z.string().optional(),
  cosplayPictureUrl: z.string().optional(),
  removeImage: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!
  const contestantId = getRouterParam(event, 'contestantId')!
  const contentType = getRequestHeader(event, 'content-type') || ''
  let data: z.infer<typeof bodySchema>
  let imagePart: { data: Buffer; type?: string } | undefined

  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    const fields: Record<string, string | boolean> = {}

    for (const part of parts || []) {
      if (!part.name) continue
      if (part.name === 'image') {
        imagePart = part as typeof imagePart
      } else if (part.name === 'removeImage') {
        fields.removeImage = part.data.toString('utf8') === 'true'
      } else {
        fields[part.name] = part.data.toString('utf8')
      }
    }

    data = bodySchema.parse(fields)
  } else {
    data = await readValidatedBody(event, bodySchema.parse)
  }

  const updateData: Record<string, string | null | undefined> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.alias !== undefined) updateData.alias = data.alias === '' ? null : data.alias
  if (data.characterName !== undefined) updateData.characterName = data.characterName === '' ? null : data.characterName
  if (data.removeImage) {
    updateData.cosplayPictureUrl = null
  } else if (data.cosplayPictureUrl !== undefined) {
    updateData.cosplayPictureUrl = data.cosplayPictureUrl === '' ? null : data.cosplayPictureUrl
  }

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
    const { error: uploadError } = await storage.storage.from(getSupabaseStorageBucket()).upload(uploadedImagePath, imagePart.data, {
      cacheControl: '31536000',
      contentType: 'image/webp',
      upsert: false,
    })

    if (uploadError) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to upload contestant image' })
    }

    updateData.cosplayPictureUrl = storage.storage.from(getSupabaseStorageBucket()).getPublicUrl(uploadedImagePath).data.publicUrl
  }

  try {
    return await prisma.contestant.update({
      where: { id: contestantId },
      data: updateData,
    })
  } catch (error) {
    if (uploadedImagePath) {
      const storage = getSupabaseStorage()
      await storage.storage.from(getSupabaseStorageBucket()).remove([uploadedImagePath])
    }
    throw error
  }
})
