import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, BookOpen, User, CreditCard, Bell, LogOut, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "名前は2文字以上である必要があります。",
  }),
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
  bio: z.string().max(500, {
    message: "自己紹介は500文字以内で入力してください。",
  }).optional(),
});

const notificationFormSchema = z.object({
  emailUpdates: z.boolean().default(false),
  courseNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  const userData = {
    name: "テスト ユーザー",
    email: "test@example.com",
    bio: "",
    membership: "フリープラン",
    joinDate: "2023年10月15日",
  };
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData.name,
      email: userData.email,
      bio: userData.bio,
    },
  });
  
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailUpdates: true,
      courseNotifications: true,
      marketingEmails: false,
    },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    console.log('Update profile with:', values);
    
    toast({
      title: "プロフィールを更新しました",
      description: "プロフィール情報が正常に更新されました。",
    });
  };
  
  const onNotificationSubmit = async (values: z.infer<typeof notificationFormSchema>) => {
    console.log('Update notification settings with:', values);
    
    toast({
      title: "通知設定を更新しました",
      description: "通知設定が正常に更新されました。",
    });
  };
  
  const handleLogout = async () => {
    console.log('Logging out');
    
    toast({
      title: "ログアウトしました",
      description: "正常にログアウトしました。",
    });
    
    navigate('/');
  };
  
  const handleDeleteAccount = async () => {
    console.log('Deleting account');
    
    toast({
      title: "アカウントを削除しました",
      description: "アカウントが正常に削除されました。ご利用ありがとうございました。",
    });
    
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl py-10 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col sm:flex-row gap-8">
          <aside className="w-full sm:w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('profile')}
              >
                <User className="mr-2 h-4 w-4" />
                プロフィール
              </Button>
              <Button
                variant={activeTab === 'subscription' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('subscription')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                メンバーシップ
              </Button>
              <Button
                variant={activeTab === 'courses' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('courses')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                受講中のコース
              </Button>
              <Button
                variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="mr-2 h-4 w-4" />
                通知設定
              </Button>
              
              <Separator className="my-4" />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ログアウトしますか？</DialogTitle>
                    <DialogDescription>
                      ログアウトすると、再度ログインするまでアカウントにアクセスできなくなります。
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">キャンセル</Button>
                    </DialogClose>
                    <Button variant="default" onClick={handleLogout}>
                      ログアウト
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    アカウント削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は取り消せません。アカウントとすべてのデータが永久に削除されます。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      削除する
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </aside>
          
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">プロフィール</h3>
                  <p className="text-sm text-muted-foreground">
                    アカウント情報を更新します
                  </p>
                </div>
                
                <Separator />
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>お名前</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>メールアドレス</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>自己紹介</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="あな���自身や学習目標について教えてください（任意）" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">変更を保存</Button>
                  </form>
                </Form>
              </div>
            )}
            
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">メンバーシップ</h3>
                  <p className="text-sm text-muted-foreground">
                    現在のプランと支払い情報を管理します
                  </p>
                </div>
                
                <Separator />
                
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h4 className="font-medium">現在のプラン</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {userData.membership} (登録日: {userData.joinDate})
                      </p>
                    </div>
                    
                    <Button variant={userData.membership === "フリープラン" ? "default" : "outline"}>
                      {userData.membership === "フリープラン" ? "プレミアムへアップグレード" : "プランを変更"}
                    </Button>
                  </div>
                </div>
                
                {userData.membership !== "フリープラン" && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">支払い方法</h4>
                    
                    <div className="bg-muted/50 rounded-lg p-4 border mb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-6 bg-gray-700 rounded mr-3"></div>
                          <div>
                            <p className="font-medium">**** **** **** 4242</p>
                            <p className="text-sm text-muted-foreground">有効期限: 04/25</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">変更</Button>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-4 mt-6">請求履歴</h4>
                    
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">2023年9月15日</p>
                          <p className="text-sm text-muted-foreground">プレミアムプラン - 月額</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">¥1,980</p>
                          <Button variant="link" size="sm" className="h-auto p-0">領収書</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">受講中のコース</h3>
                  <p className="text-sm text-muted-foreground">
                    学習中のコースと進捗状況
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="sm:w-24 sm:h-16 overflow-hidden rounded bg-muted">
                        <img 
                          src="/images/course1.jpg" 
                          alt="UIデザインの基礎" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">UIデザインの基礎</h4>
                        <p className="text-sm text-muted-foreground">講師: 鈴木 健太</p>
                        <div className="mt-2 flex items-center">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '45%' }}></div>
                          </div>
                          <span className="ml-2 text-sm">45%</span>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" onClick={() => navigate('/courses/1')}>
                            続きから学習
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="sm:w-24 sm:h-16 overflow-hidden rounded bg-muted">
                        <img 
                          src="/images/course2.jpg" 
                          alt="Webアニメーション制作" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Webアニメーション制作</h4>
                        <p className="text-sm text-muted-foreground">講師: 田中 美咲</p>
                        <div className="mt-2 flex items-center">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '20%' }}></div>
                          </div>
                          <span className="ml-2 text-sm">20%</span>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" onClick={() => navigate('/courses/2')}>
                            続きから学習
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">通知設定</h3>
                  <p className="text-sm text-muted-foreground">
                    通知の受け取り方法を設定します
                  </p>
                </div>
                
                <Separator />
                
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="emailUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">サービスの更新情報</FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">
                              新機能やサービスの更新に関するお知らせを受け取ります
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="courseNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">コース通知</FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">
                              新しいレッスンの公開や学習リマインダーを受け取ります
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">マーケティングメール</FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">
                              キャンペーンやおすすめコースの情報を受け取ります
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">設定を保存</Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
