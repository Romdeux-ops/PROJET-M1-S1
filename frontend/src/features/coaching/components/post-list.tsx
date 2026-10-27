import { Loader2, MessageSquare, Trash2 } from 'lucide-react'

import { AuthorizedImage } from '@/components/authorized-image'
import { EmptyState } from '@/components/empty-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { initials } from '@/lib/utils'

import { useDeletePost, usePosts } from '../hooks/use-coaching'

interface PostListProps {
  coachId: string
  /** Affiche le bouton de suppression (uniquement pour l'auteur). */
  canDelete?: boolean
}

export function PostList({ coachId, canDelete = false }: PostListProps) {
  const { data: posts, isLoading } = usePosts(coachId)
  const deletePost = useDeletePost(coachId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return <EmptyState icon={MessageSquare} title="Aucune publication" className="py-10" />
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="flex gap-3">
            <Avatar>
              {post.coachAvatarUrl && (
                <AvatarImage src={post.coachAvatarUrl} alt={post.coachName} />
              )}
              <AvatarFallback className="bg-brand text-xs font-semibold text-white">
                {initials(post.coachName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{post.coachName}</p>
                <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap text-foreground">{post.content}</p>
              {post.imageUrl && (
                <AuthorizedImage
                  src={post.imageUrl}
                  className="mt-2 max-h-64 rounded-lg border object-cover"
                />
              )}
            </div>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={deletePost.isPending}
                onClick={() => deletePost.mutate(post.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
