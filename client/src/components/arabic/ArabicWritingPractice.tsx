import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Check, Star, Palette, Download } from 'lucide-react';
import { ArabicLetter } from '@/types/arabicLearning.types';
import { arabicAlphabet } from '@/data/arabicLearningData';
import { soundEffects } from '@/utils/sounds';

interface ArabicWritingPracticeProps {
  onLetterPracticed: (letterId: string) => void;
  practicedLetters: string[];
  childAge: 3 | 4 | 5 | 6;
}

interface DrawingPoint {
  x: number;
  y: number;
}

export const ArabicWritingPractice: React.FC<ArabicWritingPracticeProps> = ({
  onLetterPracticed,
  practicedLetters,
  childAge
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [allStrokes, setAllStrokes] = useState<DrawingPoint[][]>([]);
  const [currentColor, setCurrentColor] = useState('#2563eb'); // Blue
  const [brushSize, setBrushSize] = useState(4);
  const [showGuide, setShowGuide] = useState(true);
  const [practiceMode, setPracticeMode] = useState<'trace' | 'free'>('trace');

  // Age-appropriate letters filtering
  const getLettersToShow = () => {
    // For simplicity, show first letters for younger children
    const count = childAge <= 4 ? 4 : childAge === 5 ? 6 : 8;
    return arabicAlphabet.slice(0, count);
  };

  const lettersToShow = getLettersToShow();
  const progress = (practicedLetters.length / lettersToShow.length) * 100;

  // Drawing colors for kids
  const colors = [
    '#2563eb', // Blue
    '#dc2626', // Red
    '#16a34a', // Green
    '#ca8a04', // Yellow
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#db2777', // Pink
    '#0891b2'  // Cyan
  ];

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const getTouchPos = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((point: DrawingPoint) => {
    setIsDrawing(true);
    setCurrentStroke([point]);
    soundEffects.playClick();
  }, []);

  const draw = useCallback((point: DrawingPoint) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setCurrentStroke(prev => {
      const newStroke = [...prev, point];
      
      // Draw the current stroke
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (newStroke.length > 1) {
        const lastPoint = newStroke[newStroke.length - 2];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      
      return newStroke;
    });
  }, [isDrawing, currentColor, brushSize]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setAllStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke([]);
      
      // Mark letter as practiced
      if (selectedLetter && !practicedLetters.includes(selectedLetter.letter)) {
        onLetterPracticed(selectedLetter.letter);
        soundEffects.playSuccess();
      }
    }
  }, [isDrawing, currentStroke, selectedLetter, practicedLetters, onLetterPracticed]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    startDrawing(point);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    draw(point);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getTouchPos(e);
    startDrawing(point);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getTouchPos(e);
    draw(point);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAllStrokes([]);
    setCurrentStroke([]);
    drawGuide();
    soundEffects.playClick();
  };

  const drawGuide = useCallback(() => {
    if (!showGuide || !selectedLetter || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw dotted outline of the letter as a guide
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(selectedLetter.letter, canvas.width / 2, canvas.height / 2);
    ctx.setLineDash([]);
  }, [showGuide, selectedLetter]);

  const handleLetterSelect = (letter: ArabicLetter) => {
    setSelectedLetter(letter);
    clearCanvas();
    setTimeout(drawGuide, 100); // Small delay to ensure canvas is cleared first
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLetter) return;
    
    const link = document.createElement('a');
    link.download = `arabic-${selectedLetter.letter}-practice.png`;
    link.href = canvas.toDataURL();
    link.click();
    soundEffects.playSuccess();
  };

  React.useEffect(() => {
    drawGuide();
  }, [drawGuide]);

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl animate-bounce">✏️</div>
          <h2 className="text-2xl font-['Fredoka_One'] bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Arabic Writing Practice!
          </h2>
          <div className="text-4xl animate-bounce delay-150">🎨</div>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm font-['Comic_Neue'] text-green-700">
            <span>Letters Practiced</span>
            <span>{practicedLetters.length} / {lettersToShow.length}</span>
          </div>
          <Progress value={progress} className="h-3 bg-green-100" />
        </div>

        {/* Practice Mode Toggle */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setPracticeMode('trace')}
            variant={practiceMode === 'trace' ? 'default' : 'outline'}
            className="font-['Comic_Neue'] font-bold"
          >
            ✏️ Trace Letters
          </Button>
          <Button
            onClick={() => setPracticeMode('free')}
            variant={practiceMode === 'free' ? 'default' : 'outline'}
            className="font-['Comic_Neue'] font-bold"
          >
            🎨 Free Drawing
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Letter Selection Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-['Fredoka_One'] text-green-700">Choose a Letter</h3>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lettersToShow.map((letter) => {
                  const isPracticed = practicedLetters.includes(letter.letter);
                  const isSelected = selectedLetter?.letter === letter.letter;

                  return (
                    <Button
                      key={letter.letter}
                      onClick={() => handleLetterSelect(letter)}
                      className={`
                        w-full p-4 h-auto transition-all duration-300
                        ${isSelected
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : isPracticed
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold">{letter.letter}</div>
                          <div>
                            <div className="text-sm font-['Comic_Neue'] font-bold">
                              {letter.english}
                            </div>
                            <div className="text-xs text-left">
                              {letter.transliteration}
                            </div>
                          </div>
                        </div>
                        
                        {isPracticed && (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drawing Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {selectedLetter && (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{selectedLetter.letter}</div>
                    <div>
                      <h3 className="text-xl font-['Fredoka_One'] text-blue-700">
                        Practice: {selectedLetter.english}
                      </h3>
                      <p className="font-['Comic_Neue'] text-blue-600">
                        {selectedLetter.transliteration}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowGuide(!showGuide)}
                      size="sm"
                      variant={showGuide ? 'default' : 'outline'}
                      className="font-['Comic_Neue']"
                    >
                      {showGuide ? '👁️ Hide Guide' : '👁️ Show Guide'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Drawing Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/70 rounded-xl">
                  {/* Color Palette */}
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-600" />
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCurrentColor(color)}
                          className={`
                            w-8 h-8 rounded-full border-2 transition-all
                            ${currentColor === color 
                              ? 'border-gray-800 scale-110' 
                              : 'border-gray-300 hover:scale-105'
                            }
                          `}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Brush Size */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-['Comic_Neue'] text-gray-600">Size:</span>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm font-['Comic_Neue'] text-gray-600">{brushSize}px</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={clearCanvas}
                      size="sm"
                      variant="outline"
                      className="font-['Comic_Neue']"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                    <Button
                      onClick={saveDrawing}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-['Comic_Neue']"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Canvas */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full border-2 border-dashed border-blue-300 rounded-xl bg-white cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                  
                  {!selectedLetter && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl">
                      <p className="text-lg font-['Comic_Neue'] text-gray-500">
                        👈 Choose a letter to start practicing!
                      </p>
                    </div>
                  )}
                </div>

                {/* Writing Tips */}
                {selectedLetter?.writing && selectedLetter.writing.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h4 className="font-['Comic_Neue'] font-bold text-orange-700 mb-2 flex items-center gap-2">
                      💡 Writing Tips
                    </h4>
                    <ul className="space-y-1">
                      {selectedLetter.writing.map((tip, index) => (
                        <li key={index} className="text-sm font-['Comic_Neue'] text-orange-800 flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cultural Note */}
                {selectedLetter?.culturalNote && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-['Comic_Neue'] font-bold text-purple-700 mb-2 flex items-center gap-2">
                      🌟 Did You Know?
                    </h4>
                    <p className="text-sm font-['Comic_Neue'] text-purple-800">
                      {selectedLetter.culturalNote}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Practice Progress */}
          {practicedLetters.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="font-['Fredoka_One'] text-green-700 mb-2">
                    Great Progress!
                  </h3>
                  <p className="font-['Comic_Neue'] text-green-600">
                    You've practiced {practicedLetters.length} letters!
                  </p>
                  
                  <div className="flex justify-center gap-2 mt-3 flex-wrap">
                    {practicedLetters.map((letterId) => {
                      const letter = arabicAlphabet.find(l => l.letter === letterId);
                      return letter ? (
                        <Badge key={letterId} className="bg-green-100 text-green-700 text-lg px-3 py-1">
                          {letter.letter}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArabicWritingPractice;