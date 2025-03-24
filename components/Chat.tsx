"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import FileUpload from './FileUpload';
import { uploadMessageAttachment } from '@/lib/storage';

interface ChatProps {
  conversationId: string;
  otherUserId: string;
}

const Chat: React.FC<ChatProps> = ({ conversationId, otherUserId }) => {
  const { currentUser, messages, setCurrentConversation } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Set the current conversation when the component mounts
  useEffect(() => {
    setCurrentConversation(conversationId);
    
    // Cleanup when component unmounts
    return () => {
      setCurrentConversation(null);
    };
  }, [conversationId, setCurrentConversation]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && attachments.length === 0) || !currentUser) return;
    
    try {
      // Add message to the conversation
      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        attachments: attachments,
        read: false
      });
      
      // Update the conversation with last message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: newMessage.trim() || 'Sent an attachment',
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${otherUserId}`]: (messages.filter(m => !m.read && m.senderId === currentUser.uid).length + 1)
      });
      
      // Clear the input and attachments
      setNewMessage('');
      setAttachments([]);
      setIsAttaching(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleAttachmentUpload = (url: string) => {
    setAttachments(prev => [...prev, url]);
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const generateAttachmentPath = (file: File) => {
    if (!currentUser) return '';
    return `messages/${conversationId}/${currentUser.uid}/${Date.now()}.${file.name.split('.').pop()}`;
  };
  
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                message.senderId === currentUser?.uid 
                  ? 'bg-primary-600 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              <div className="text-sm">{message.text}</div>
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((url: string, i: number) => {
                    // Check if it's an image
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    
                    return isImage ? (
                      <div key={i} className="rounded overflow-hidden">
                        <img src={url} alt="Attachment" className="max-w-full" />
                      </div>
                    ) : (
                      <div key={i} className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm underline"
                        >
                          Attachment
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className={`text-xs mt-1 ${message.senderId === currentUser?.uid ? 'text-primary-200' : 'text-gray-500'}`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((url, index) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
              
              return (
                <div key={index} className="relative group">
                  {isImage ? (
                    <div className="h-16 w-16 rounded overflow-hidden">
                      <img src={url} alt="Attachment" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded bg-gray-200 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Message input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            
            {isAttaching && (
              <div className="mt-2">
                <FileUpload
                  onUploadComplete={handleAttachmentUpload}
                  generatePath={generateAttachmentPath}
                  allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']}
                  maxSizeMB={10}
                  buttonText="Select File"
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsAttaching(!isAttaching)}
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-500 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <button
              type="submit"
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
