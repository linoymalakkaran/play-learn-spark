import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface WeatherStationProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Weather {
  name: string;
  emoji: string;
  description: string;
  activity: string;
  clothing: string[];
}

const weatherTypes: Weather[] = [
  { 
    name: 'Sunny', 
    emoji: '☀️', 
    description: 'Bright and warm day!', 
    activity: 'Perfect for playing outside!',
    clothing: ['👕 T-shirt', '🩳 Shorts', '👟 Sneakers', '🕶️ Sunglasses']
  },
  { 
    name: 'Rainy', 
    emoji: '🌧️', 
    description: 'Water falls from the clouds!', 
    activity: 'Great for reading inside!',
    clothing: ['🧥 Raincoat', '☔ Umbrella', '👢 Rain boots', '👖 Long pants']
  },
  { 
    name: 'Snowy', 
    emoji: '❄️', 
    description: 'White flakes falling down!', 
    activity: 'Time to build a snowman!',
    clothing: ['🧥 Winter coat', '🧤 Gloves', '🧣 Scarf', '👢 Snow boots']
  },
  { 
    name: 'Cloudy', 
    emoji: '☁️', 
    description: 'Gray clouds cover the sky!', 
    activity: 'Nice day for a walk!',
    clothing: ['👕 Light shirt', '👖 Pants', '👟 Shoes', '🧥 Light jacket']
  },
  { 
    name: 'Windy', 
    emoji: '💨', 
    description: 'Air is moving fast!', 
    activity: 'Perfect for flying a kite!',
    clothing: ['🧥 Jacket', '👖 Pants', '👟 Sneakers', '🧢 Hat']
  },
  { 
    name: 'Hot', 
    emoji: '🔥', 
    description: 'Very warm temperature!', 
    activity: 'Stay cool in the shade!',
    clothing: ['👕 Tank top', '🩳 Shorts', '🩴 Sandals', '🧢 Sun hat']
  },
  { 
    name: 'Cold', 
    emoji: '🥶', 
    description: 'Very chilly temperature!', 
    activity: 'Time for hot chocolate!',
    clothing: ['🧥 Warm coat', '👖 Pants', '👢 Boots', '🧤 Mittens']
  },
  { 
    name: 'Stormy', 
    emoji: '⛈️', 
    description: 'Thunder and lightning!', 
    activity: 'Safe to stay inside!',
    clothing: ['🧥 Raincoat', '👖 Pants', '👢 Boots', '☔ Umbrella']
  },
];

export const WeatherStation = ({ childAge, onComplete, onBack }: WeatherStationProps) => {
  const [currentWeather, setCurrentWeather] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState<Weather[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Ensure at least 8 weather types
    const numWeather = Math.max(8, childAge <= 4 ? 8 : 8);
    setSelectedWeather(weatherTypes.slice(0, Math.min(numWeather, weatherTypes.length)));
  }, [childAge]);

  const handleWeatherClick = async (weather: Weather) => {
    await soundEffects.playSuccess();
    setShowDetails(true);
    setScore(prev => prev + 1);
    
    setTimeout(async () => {
      setShowDetails(false);
      
      if (currentWeather < selectedWeather.length - 1) {
        setCurrentWeather(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 3000);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedWeather.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-soft to-secondary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🌤️</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-4">
            Weather Expert!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You learned about {selectedWeather.length} different types of weather!
          </p>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            {selectedWeather.map((weather, index) => (
              <div key={weather.name} className="text-center">
                <div className="text-3xl mb-2 float" style={{ animationDelay: `${index * 0.1}s` }}>
                  {weather.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-xs">{weather.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Fantastic! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-soft to-secondary-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Weather {currentWeather + 1} of {selectedWeather.length}
            </div>
            <Progress value={((currentWeather + 1) / selectedWeather.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-6">
            Weather Station! 🌦️
          </h1>
          
          {selectedWeather[currentWeather] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Click on the weather to learn about it!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-6"
                onClick={() => handleWeatherClick(selectedWeather[currentWeather])}
              >
                <div className="text-9xl mb-4 wiggle animate-bounce-slow">
                  {selectedWeather[currentWeather].emoji}
                </div>
                
                {!showDetails && (
                  <div className="text-4xl font-['Comic_Neue'] font-bold text-success animate-pulse">
                    {selectedWeather[currentWeather].name}
                  </div>
                )}
              </div>

              {showDetails && (
                <div className="bounce-in animate-scale-in space-y-4">
                  <div className="text-3xl font-['Comic_Neue'] font-bold text-primary mb-4 animate-bounce">
                    {selectedWeather[currentWeather].description}
                  </div>
                  
                  <div className="text-xl text-secondary font-bold animate-fade-in">
                    {selectedWeather[currentWeather].activity}
                  </div>
                  
                  <div className="bg-magic-soft p-4 rounded-lg">
                    <h3 className="text-lg font-['Comic_Neue'] font-bold text-magic mb-2">
                      What to wear:
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedWeather[currentWeather].clothing.map((item, index) => (
                        <div key={index} className="text-sm font-['Comic_Neue'] animate-fade-in" 
                             style={{animationDelay: `${index * 0.2}s`}}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4 space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                        🌟
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age-appropriate hint */}
              {childAge <= 4 && !showDetails && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the weather to see what it's like! ☀️
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedWeather[currentWeather] && !showDetails && (
          <Card className="mt-6 p-6 bg-primary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-primary mb-2">
              Weather Tip! 🌡️
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              Different weather happens because of changes in the air and water in the sky!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};