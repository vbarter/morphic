'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AI, UIState } from '@/app/actions'
import {useUIState, useActions, useAIState} from 'ai/rsc'
import { cn } from '@/lib/utils'
import { UserMessage } from './user-message'
import { Button } from './ui/button'
import { ArrowRight, Plus, Mic } from 'lucide-react'
import { EmptyScreen } from './empty-screen'
import { nanoid } from 'ai'
import {Textarea} from "@/components/ui/textarea";
import {useRecordVoice} from "@/lib/hooks/use-record-voice";
import {white} from "next/dist/lib/picocolors";

interface ChatPanelProps {
  messages: UIState
}

export function ChatPanel({ messages }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [, setMessages] = useUIState<typeof AI>()
  const { submit } = useActions()
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showEmptyScreen, setShowEmptyScreen] = useState(true)

  const input2Ref = useRef<HTMLInputElement>(null);

  const { handleClick, text, isRecording } = useRecordVoice();

  // 麦克风状态
  const [isMicActive, setMicIsActive] = useState(false);

  const router = useRouter()


  // Focus on input when button is pressed
  useEffect(() => {
    if (isButtonPressed) {
      inputRef.current?.focus()
      setIsButtonPressed(false)
    }
  }, [isButtonPressed])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Clear messages if button is pressed
    if (isButtonPressed) {
      handleClear()
      setIsButtonPressed(false)
    }

    // Add user message to UI state
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        // isGenerating: false,
        component: <UserMessage message={input} />
      }
    ])

    // Submit and get response message
    const formData = new FormData(e.currentTarget)
    const responseMessage = await submit(formData)
    setMessages(currentMessages => [...currentMessages, responseMessage as any])
  }

  // Clear messages
  const handleClear = () => {
    router.push('/')
  }

  useEffect(() => {
    // focus on input when the page loads
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (text) {
      setInput(text);
    }
  }, [text]);

  const handleMicClick = () => {
    const textarea = document.getElementById('input') as HTMLTextAreaElement;

    if (isMicActive) {
      textarea.disabled = false
      setInput("输入您的问题 ...")

      console.log("mic is active")
      setMicIsActive(false);
    } else {
      textarea.disabled = true
      setInput("正在语音输入 ...")
      console.log("mic is inactive")
      setMicIsActive(true);
    }
    handleClick(input2Ref);
  }

  // If there are messages and the new button has not been pressed, display the new Button
  if (messages.length > 0 && !isButtonPressed) {
    return (
      <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center mx-auto pointer-events-none">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto"
          onClick={() => handleClear()}
        >
          <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
            新搜索
          </span>
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
        </Button>
      </div>
    )
  }

  return (

      <div
          className={
            'fixed bottom-8 left-0 right-0 top-10 mx-auto h-screen flex flex-col items-center justify-center'
          }
      >
        <h1 className="text-lg font-semibold text-center mb-5">基于AI的问答搜索引擎</h1>


        <div className='grid max-w-2xl w-full px-6 space-y-4'>
          <div className="grid-cols-1">
            <form onSubmit={handleSubmit} className="max-w-2xl w-full px-6 ">
              <div className="relative flex items-center w-full">
                <div className="flex w-full items-center">
                  <Textarea id={'input'}
                      ref={inputRef}
                      name="input"
                      rows={1}
                      tabIndex={0}
                      placeholder="输入您的问题 ..."
                      spellCheck={false}
                      value={input}
                      className="resize-none w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'"
                      onChange={e => {
                        setInput(e.target.value)
                        setShowEmptyScreen(e.target.value.length === 0)
                      }}
                      onKeyDown={e => {
                        if (
                            e.key === 'Enter' &&
                            !e.shiftKey &&
                            !e.nativeEvent.isComposing
                        ) {
                          e.preventDefault()
                          const textarea = e.target as HTMLTextAreaElement
                          textarea.form?.requestSubmit()
                        }
                      }}
                      onFocus={() => setShowEmptyScreen(true)}
                      onBlur={() => setShowEmptyScreen(false)}
                  />
                  {isRecording && (
                      <div className="absolute right-1/2  h-4 w-4 animate-pulse rounded-full bg-red-400"/>
                  )}
                  <Button
                      type="submit"
                      size={'icon'}
                      variant={'ghost'}
                      data-umami-event="搜索"
                      data-umami-event-search={input}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2"
                      disabled={input.length === 0}
                  >
                    <ArrowRight id="arrow" size={20}/>
                  </Button>

                </div>

              </div>
              <EmptyScreen
                  submitMessage={message => {
                    setInput(message)
                  }}
                  className={cn(showEmptyScreen ? 'visible' : 'invisible')}
              />

              <div id="mic" className="mi flex justify-center mt-16">
                <button onClick={(e) => {
                  e.preventDefault(); // 阻止表单默认的提交行为
                  handleMicClick();   // 执行你的handleMicClick函数
                }} className={`px-1 mr-0 w-full flex justify-center ${isMicActive ? 'animate-pulse' : ''}`}>
                  <Mic size={60}/>
                </button>
              </div>
            </form>
          </div>


        </div>

        {/*<div className='grid max-w-2xl w-full px-6'>*/}
        {/*  <div className="grid-cols-1">*/}
        {/*    <form onSubmit={handleSubmit} className="max-w-2xl w-full px-6 ">*/}
        {/*      <div className="relative flex items-center w-full">*/}
        {/*        <Textarea*/}
        {/*            ref={inputRef}*/}
        {/*            name="input"*/}
        {/*            rows={1}*/}
        {/*            tabIndex={0}*/}
        {/*            placeholder="输入您的问题 ..."*/}
        {/*            spellCheck={false}*/}
        {/*            value={input}*/}
        {/*            className="resize-none w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'"*/}
        {/*            onChange={e => {*/}
        {/*              setInput(e.target.value)*/}
        {/*              setShowEmptyScreen(e.target.value.length === 0)*/}
        {/*            }}*/}
        {/*            onKeyDown={e => {*/}
        {/*              // Enter should submit the form*/}
        {/*              if (*/}
        {/*                  e.key === 'Enter' &&*/}
        {/*                  !e.shiftKey &&*/}
        {/*                  !e.nativeEvent.isComposing*/}
        {/*              ) {*/}
        {/*                // Prevent the default action to avoid adding a new line*/}
        {/*                e.preventDefault()*/}
        {/*                const textarea = e.target as HTMLTextAreaElement*/}
        {/*                textarea.form?.requestSubmit()*/}
        {/*              }*/}
        {/*            }}*/}
        {/*            onFocus={() => setShowEmptyScreen(true)}*/}
        {/*            onBlur={() => setShowEmptyScreen(false)}*/}
        {/*        />*/}
        {/*        <Button*/}
        {/*            type="submit"*/}
        {/*            size={'icon'}*/}
        {/*            variant={'ghost'}*/}
        {/*            data-umami-event="搜索"*/}
        {/*            data-umami-event-search={input}*/}
        {/*            className="absolute right-2 top-1/2 transform -translate-y-1/2 grid-cols-1"*/}

        {/*            disabled={input.length === 0}*/}
        {/*        >*/}
        {/*          <ArrowRight id="arrow" size={20}/>*/}
        {/*        </Button>*/}
        {/*      </div>*/}
        {/*      <EmptyScreen*/}
        {/*          submitMessage={message => {*/}
        {/*            setInput(message)*/}
        {/*          }}*/}
        {/*          className={cn(showEmptyScreen ? 'visible' : 'invisible')}*/}
        {/*      />*/}
        {/*    </form>*/}
        {/*  </div>*/}
        {/*  <div id="mic" className="px-6 grid-cols-2">*/}
        {/*    <button onClick={handleMicClick}>*/}
        {/*        <Mic size={20} className="mr-2"/>*/}
        {/*    </button>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

  )
}
