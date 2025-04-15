import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null);
  const loginCaptchaRef = useRef<HCaptcha>(null);
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState<string | null>(null);
  const registerCaptchaRef = useRef<HCaptcha>(null);

  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [captchaVisible, setCaptchaVisible] = useState<boolean>(false);
  
  useEffect(() => {
    console.log("AuthPage mounted, checking captcha visibility");
    const checkCaptchaElements = () => {
      const captchaElements = document.querySelectorAll('iframe[src*="hcaptcha"]');
      if (captchaElements.length > 0) {
        console.log("hCaptcha elements found:", captchaElements.length);
        setCaptchaVisible(true);
      } else {
        console.log("No hCaptcha elements found yet");
      }
    };
    
    checkCaptchaElements();
    
    const observer = new MutationObserver(checkCaptchaElements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginCaptchaToken) {
      toast({
        title: "Ошибка проверки",
        description: "Пожалуйста, подтвердите, что вы не робот",
        variant: "destructive"
      });
      setCaptchaError("Пожалуйста, подтвердите, что вы не робот");
      return;
    }
    
    setLoginLoading(true);
    setCaptchaError(null);
    
    try {
      console.log("Attempting login with email:", loginEmail);
      const result = await signIn(loginEmail, loginPassword, loginCaptchaToken);
      
      if (result?.data && !result?.error) {
        console.log("Login successful, navigating to /home");
        navigate('/home');
      } else {
        console.log("Login failed:", result?.error);
        if (loginCaptchaRef.current) {
          loginCaptchaRef.current.resetCaptcha();
          setLoginCaptchaToken(null);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== registerPasswordConfirm) {
      toast({
        title: "Ошибка валидации",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }
    
    if (!registerCaptchaToken) {
      toast({
        title: "Ошибка проверки",
        description: "Пожалуйста, подтвердите, что вы не робот",
        variant: "destructive"
      });
      setCaptchaError("Пожалуйста, подтвердите, что вы не робот");
      return;
    }
    
    setRegisterLoading(true);
    setCaptchaError(null);
    
    try {
      const result = await signUp(registerEmail, registerPassword, registerName, registerCaptchaToken);
      
      if (!result?.error) {
        navigate('/home');
      }
    } finally {
      setRegisterLoading(false);
      setRegisterCaptchaToken(null);
      if (registerCaptchaRef.current) {
        registerCaptchaRef.current.resetCaptcha();
      }
    }
  };

  const handleCaptchaVerify = (token: string, type: 'login' | 'register') => {
    console.log(`CAPTCHA token received for ${type}:`, token);
    if (type === 'login') {
      setLoginCaptchaToken(token);
    } else {
      setRegisterCaptchaToken(token);
    }
    setCaptchaError(null);
    setCaptchaVisible(true);
  };

  const handleCaptchaError = (err: any) => {
    console.error("hCaptcha error occurred:", err);
    setCaptchaError("Произошла ошибка при загрузке капчи. Пожалуйста, перезагрузите страницу.");
    setCaptchaVisible(false);
  };

  const handleCaptchaExpire = () => {
    console.log("hCaptcha token expired");
    setLoginCaptchaToken(null);
    setRegisterCaptchaToken(null);
  };
  
  console.log("AuthPage mounted, hCaptcha should initialize now");
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-volunteer-purple rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-3xl font-bold">Волонтер</h1>
          <p className="text-gray-600 mt-2">Платформа для волонтеров и организаторов мероприятий</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Вход в систему</CardTitle>
                <CardDescription>
                  Войдите в свою учетную запись, чтобы продолжить
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col items-center py-2">
                    <p className="text-sm text-gray-500 mb-2">Пожалуйста, подтвердите, что вы не робот:</p>
                    <HCaptcha
                      ref={loginCaptchaRef}
                      sitekey="73a26fa0-3d7c-430a-bb06-2f5ca6bc56ea"
                      onVerify={(token) => handleCaptchaVerify(token, 'login')}
                      onError={handleCaptchaError}
                      onExpire={handleCaptchaExpire}
                      theme="light"
                      size="normal"
                      reCaptchaCompat={false}
                    />
                    {captchaError && <p className="text-red-500 mt-2 text-sm">{captchaError}</p>}
                    {!captchaError && !loginCaptchaToken && !captchaVisible && (
                      <p className="text-amber-500 mt-2 text-sm">
                        Если капча не отображается, проверьте блокировщики рекламы и перезагрузите страницу
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Вход...' : 'Войти'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Создать аккаунт</CardTitle>
                <CardDescription>
                  Зарегистрируйтесь, чтобы стать волонтером
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input 
                      id="name" 
                      placeholder="Иван Иванов" 
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirm">Подтверждение пароля</Label>
                    <Input 
                      id="register-password-confirm" 
                      type="password" 
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col items-center py-2">
                    <p className="text-sm text-gray-500 mb-2">Пожалуйста, подтвердите, что вы не робот:</p>
                    <HCaptcha
                      ref={registerCaptchaRef}
                      sitekey="73a26fa0-3d7c-430a-bb06-2f5ca6bc56ea"
                      onVerify={(token) => handleCaptchaVerify(token, 'register')}
                      onError={handleCaptchaError}
                      onExpire={handleCaptchaExpire}
                      theme="light"
                      size="normal"
                      reCaptchaCompat={false}
                    />
                    {captchaError && <p className="text-red-500 mt-2 text-sm">{captchaError}</p>}
                    {!captchaError && !registerCaptchaToken && !captchaVisible && (
                      <p className="text-amber-500 mt-2 text-sm">
                        Если капча не отображается, проверьте блокировщики рекламы и перезагрузите страницу
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerLoading}
                  >
                    {registerLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
