
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Play, Pause, Volume2, VolumeX, 
  Maximize, Minimize, SkipBack, SkipForward, 
  Award, MessageSquare, Book, CheckCircle,
  ChevronLeft
} from 'lucide-react';

// Mock course data
const courseDetails = {
  id: '1',
  title: 'デザイン思考の基礎から応用まで',
  instructor: '山田 太郎',
  description: 'このコースでは、デザイン思考の基本概念から実践的な応用方法まで、体系的に学ぶことができます。実際のケーススタディを通じて、ユーザー中心の問題解決アプローチを身につけましょう。',
  modules: [
    {
      id: 'm1',
      title: 'モジュール1: デザイン思考入門',
      lessons: [
        { id: 'l1', title: 'デザイン思考とは何か', duration: '12:30', isCompleted: true, isCurrent: true },
        { id: 'l2', title: 'デザイン思考の5つのステップ', duration: '15:45', isCompleted: false, isCurrent: false },
        { id: 'l3', title: 'デザイン思考の歴史と発展', duration: '10:20', isCompleted: false, isCurrent: false },
      ]
    },
    {
      id: 'm2',
      title: 'モジュール2: リサーチと共感',
      lessons: [
        { id: 'l4', title: 'ユーザーリサーチの方法論', duration: '18:15', isCompleted: false, isCurrent: false },
        { id: 'l5', title: 'インタビュー技術と質問設計', duration: '14:30', isCompleted: false, isCurrent: false },
        { id: 'l6', title: 'ユーザーの声を整理する', duration: '11:45', isCompleted: false, isCurrent: false },
      ]
    },
    {
      id: 'm3',
      title: 'モジュール3: 問題定義と分析',
      lessons: [
        { id: 'l7', title: '問題の再フレーミング', duration: '13:20', isCompleted: false, isCurrent: false },
        { id: 'l8', title: 'インサイトの発見と活用', duration: '16:10', isCompleted: false, isCurrent: false },
        { id: 'l9', title: 'ペルソナとカスタマージャーニー', duration: '17:35', isCompleted: false, isCurrent: false },
      ]
    }
  ]
};

const VideoPlayer = () => {
  const { courseId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  // Hide controls after inactivity
  useEffect(() => {
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);
  
  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle video progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };
  
  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseInt(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(parseInt(e.target.value));
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
      } else {
        videoRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!isFullscreen) {
        if (videoContainerRef.current.requestFullscreen) {
          videoContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };
  
  // Mouse movement handler
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Current time and duration
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  
  // Update current time
  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current) {
        setCurrentTime(formatTime(videoRef.current.currentTime));
        setDuration(formatTime(videoRef.current.duration));
      }
    };
    
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="pt-16 md:pt-20 flex-grow">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
          {/* Video player */}
          <div 
            ref={videoContainerRef}
            className={`relative flex-grow bg-black ${isFullscreen ? 'h-screen' : 'h-[40vh] md:h-auto'}`}
            onMouseMove={handleMouseMove}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              poster="/images/course1.jpg"
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
            >
              <source src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Video controls */}
            <div 
              className={`absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/40 via-transparent to-black/60 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top bar */}
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white bg-black/30 hover:bg-black/50"
                  onClick={() => window.history.back()}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  戻る
                </Button>
                <h1 className="text-white text-lg font-medium hidden md:block">
                  {courseDetails.title}
                </h1>
                <div className="w-24" />
              </div>
              
              {/* Center play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-20 w-20 rounded-full bg-black/30 hover:bg-black/50 text-white transition-opacity duration-300 ${
                    isPlaying ? 'opacity-0' : 'opacity-100'
                  }`}
                  onClick={togglePlay}
                >
                  <Play className="h-10 w-10 ml-1" />
                </Button>
              </div>
              
              {/* Bottom control bar */}
              <div className="space-y-2">
                {/* Progress bar */}
                <div className="w-full flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Play/Pause */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/10"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    
                    {/* Skip backward/forward */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/10"
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/10"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                    
                    {/* Volume */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/10"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      <div className="w-20 hidden md:block">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                      </div>
                    </div>
                    
                    {/* Time */}
                    <div className="text-white text-xs md:text-sm">
                      {currentTime} / {duration}
                    </div>
                  </div>
                  
                  {/* Right controls */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/10"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? (
                        <Minimize className="h-5 w-5" />
                      ) : (
                        <Maximize className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course content sidebar */}
          <div className={`flex-shrink-0 lg:w-[350px] border-l overflow-auto ${menuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">コース内容</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden"
                  onClick={() => setMenuOpen(false)}
                >
                  閉じる
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">{courseDetails.title}</h3>
                <p className="text-muted-foreground text-sm">{courseDetails.instructor}</p>
              </div>
              
              <div className="space-y-6">
                {courseDetails.modules.map((module) => (
                  <div key={module.id}>
                    <h4 className="font-medium mb-3">{module.title}</h4>
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className={`p-2 rounded-md flex items-start transition-colors cursor-pointer ${
                            lesson.isCurrent 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-secondary'
                          }`}
                        >
                          <div className="flex-shrink-0 mr-3 mt-1">
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            ) : lesson.isCurrent ? (
                              <Play className="h-4 w-4 fill-primary text-primary" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="text-sm font-medium">{lesson.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{lesson.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Course details */}
        <div className="container-wide py-8 md:py-12">
          {/* Mobile menu toggle */}
          <div className="lg:hidden mb-6">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setMenuOpen(true)}
            >
              コース内容を表示
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:flex-1">
              <h2 className="heading-3 mb-4">コース詳細</h2>
              <p className="text-muted-foreground mb-6">
                {courseDetails.description}
              </p>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-secondary/50 rounded-lg p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                    <Book className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">9つのレッスン</h3>
                  <p className="text-sm text-muted-foreground">
                    体系的に学べるように設計された充実のカリキュラム
                  </p>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">修了証明書</h3>
                  <p className="text-sm text-muted-foreground">
                    すべてのモジュールを完了すると修了証明書を取得できます
                  </p>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Q&Aサポート</h3>
                  <p className="text-sm text-muted-foreground">
                    講師に直接質問でき、疑問点をすぐに解決できます
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-[350px] lg:flex-shrink-0">
              <div className="bg-card border rounded-xl overflow-hidden sticky top-24">
                <div className="aspect-video">
                  <img 
                    src="/images/course1.jpg" 
                    alt={courseDetails.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="chip bg-primary/10 text-primary">
                      プレミアム
                    </div>
                    <div className="text-xl font-bold">
                      ¥12,800
                    </div>
                  </div>
                  
                  <Button className="w-full mb-4">
                    このコースを購入
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">このコースには以下が含まれます：</p>
                    <ul className="space-y-1">
                      <li>• 3時間以上の動画コンテンツ</li>
                      <li>• 9つのダウンロード可能なリソース</li>
                      <li>• モバイル・PC両対応</li>
                      <li>• 完了後の修了証明書</li>
                      <li>• 永久アクセス</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoPlayer;
