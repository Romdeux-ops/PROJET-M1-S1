import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import { useCreatePost } from '../hooks/use-coaching'
import { type CreatePostInput, createPostSchema } from '../schemas'

export function PostForm({ coachId }: { coachId: string }) {
  const createPost = useCreatePost(coachId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: '' },
  })

  function clearImage() {
    setImage(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  const onSubmit = form.handleSubmit((values) => {
    createPost.mutate(
      { ...values, image: image ?? undefined },
      {
        onSuccess: () => {
          form.reset()
          clearImage()
        },
      },
    )
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Partagez une actualité, un conseil, une victoire d'un de vos athlètes..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {preview && (
          <div className="relative w-fit">
            <img src={preview} alt="Aperçu" className="max-h-48 rounded-lg border object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute -top-2 -right-2 rounded-full shadow"
              onClick={clearImage}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setImage(file)
              setPreview(URL.createObjectURL(file))
            }
            e.target.value = ''
          }}
        />

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus /> {preview ? 'Changer la photo' : 'Ajouter une photo'}
          </Button>
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? <Loader2 className="animate-spin" /> : <Send />}
            Publier
          </Button>
        </div>
      </form>
    </Form>
  )
}
