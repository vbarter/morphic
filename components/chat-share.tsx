'use client'

import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import { Share2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
    DialogDescription,
    DialogTitle
} from './ui/dialog'
import { shareChat } from '@/lib/actions/chat'
import { toast } from 'sonner'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Spinner } from './ui/spinner'

interface ChatShareProps {
    chatId: string
    className?: string
}

export function ChatShare({ chatId, className }: ChatShareProps) {
    const [open, setOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })

    const handleClick = async () => {
        startTransition(async () => {
            const result = await shareChat(chatId)
            if (!result) {
                toast.error('Failed to share chat')
            }

            if (!result?.sharePath) {
                toast.error('Could not copy link to clipboard')
                return
            }

            const url = new URL(result.sharePath, window.location.origin)
            copyToClipboard(url.toString())
            toast.success('已复制')
            setOpen(false)
        })
    }

    return (
        <div className={className}>
            <Dialog
                open={open}
                onOpenChange={open => setOpen(open)}
                aria-labelledby="share-dialog-title"
                aria-describedby="share-dialog-description"
            >
                <DialogTrigger asChild>
                    <Button
                        className="rounded-full"
                        size="icon"
                        variant={'ghost'}
                        onClick={() => setOpen(true)}
                    >
                        <Share2 size={14}/>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>分享搜米结果</DialogTitle>
                        <DialogDescription>
                            复制地址，分享给好友，让他们也来体验搜米的魅力吧！
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="items-center">
                        <Button onClick={handleClick} disabled={pending} size="sm">
                            {pending ? <Spinner /> : '复制链接地址'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}