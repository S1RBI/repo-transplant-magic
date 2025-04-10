
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useChatbot } from '@/hooks/use-chatbot';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, error } = useChatbot();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            className="rounded-full h-14 w-14 shadow-lg" 
            aria-label="Открыть чат с ассистентом"
          >
            <Bot size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className={`w-[320px] sm:w-[380px] p-0 flex flex-col ${isMinimized ? 'h-auto max-h-[80px]' : 'h-[500px] sm:h-[600px]'}`}
        >
          <SheetHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <SheetTitle className="flex items-center gap-2">
                <Bot size={20} /> Ассистент
              </SheetTitle>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? "Развернуть" : "Свернуть"}
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  aria-label="Закрыть"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          </SheetHeader>
          
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.filter(m => m.role !== 'system').map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 max-w-[85%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                  >
                    <div 
                      className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      {formatMessage(message.content)}
                    </div>
                    {message.timestamp && (
                      <div className={`text-xs mt-1 text-gray-500 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-1 items-center mb-4 max-w-[85%]">
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription className="text-sm">
                      Ошибка: {error}
                    </AlertDescription>
                  </Alert>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <SheetFooter className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="min-h-[50px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    aria-label="Отправить"
                  >
                    <Send size={18} />
                  </Button>
                </form>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
