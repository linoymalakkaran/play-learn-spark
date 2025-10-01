import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface TransportationProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Vehicle {
  name: string;
  emoji: string;
  sound: string;
  location: string;
  description: string;
}

const vehicles: Vehicle[] = [
  { name: 'Car', emoji: '🚗', sound: 'Vroom vroom!', location: 'Road', description: 'Drives on roads and streets!' },
  { name: 'Bus', emoji: '🚌', sound: 'Beep beep!', location: 'Road', description: 'Carries many people!' },
  { name: 'Train', emoji: '🚂', sound: 'Choo choo!', location: 'Railway', description: 'Runs on train tracks!' },
  { name: 'Airplane', emoji: '✈️', sound: 'Whoosh!', location: 'Sky', description: 'Flies high in the sky!' },
  { name: 'Boat', emoji: '🚤', sound: 'Splash!', location: 'Water', description: 'Sails on rivers and seas!' },
  { name: 'Bicycle', emoji: '🚲', sound: 'Ring ring!', location: 'Path', description: 'You pedal with your feet!' },
  { name: 'Motorcycle', emoji: '🏍️', sound: 'Vroom!', location: 'Road', description: 'Fast bike with engine!' },
  { name: 'Helicopter', emoji: '🚁', sound: 'Whirr whirr!', location: 'Sky', description: 'Spins blades to fly!' },
  { name: 'Ship', emoji: '🚢', sound: 'Toot toot!', location: 'Ocean', description: 'Big boat for long trips!' },
  { name: 'Truck', emoji: '🚛', sound: 'Honk honk!', location: 'Road', description: 'Carries heavy things!' },
];

export const Transportation = ({ childAge, onComplete, onBack }: TransportationProps) => {
  const [currentVehicle, setCurrentVehicle] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Ensure at least 8 vehicles
    const numVehicles = Math.max(8, childAge <= 4 ? 8 : 10);
    setSelectedVehicles(vehicles.slice(0, Math.min(numVehicles, vehicles.length)));
  }, [childAge]);

  const handleVehicleClick = async (vehicle: Vehicle) => {
    await soundEffects.playSuccess();
    setShowDetails(true);
    setScore(prev => prev + 1);
    
    setTimeout(async () => {
      setShowDetails(false);
      
      if (currentVehicle < selectedVehicles.length - 1) {
        setCurrentVehicle(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 2500);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedVehicles.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-soft to-secondary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">🚗</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-4">
            Transportation Expert!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You learned about {selectedVehicles.length} amazing vehicles!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {selectedVehicles.slice(0, 10).map((vehicle, index) => (
              <div key={vehicle.name} className="text-center">
                <div className="text-3xl mb-2 float" style={{ animationDelay: `${index * 0.1}s` }}>
                  {vehicle.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-xs">{vehicle.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            All Aboard! 🌟
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
              Vehicle {currentVehicle + 1} of {selectedVehicles.length}
            </div>
            <Progress value={((currentVehicle + 1) / selectedVehicles.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-success mb-6">
            Transportation Adventure! 🚗
          </h1>
          
          {selectedVehicles[currentVehicle] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Click on the {selectedVehicles[currentVehicle].name.toLowerCase()} to learn about it!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                onClick={() => handleVehicleClick(selectedVehicles[currentVehicle])}
              >
                <div className="text-9xl mb-4 wiggle animate-bounce-slow">
                  {selectedVehicles[currentVehicle].emoji}
                </div>
                
                {!showDetails && (
                  <div className="text-4xl font-['Comic_Neue'] font-bold text-success animate-pulse">
                    {selectedVehicles[currentVehicle].name}
                  </div>
                )}
              </div>

              {showDetails && (
                <div className="bounce-in animate-scale-in space-y-4">
                  <div className="text-5xl font-['Comic_Neue'] font-bold text-primary mb-4 animate-bounce">
                    {selectedVehicles[currentVehicle].sound}
                  </div>
                  
                  <div className="text-xl text-muted-foreground animate-fade-in">
                    {selectedVehicles[currentVehicle].description}
                  </div>
                  
                  <div className="bg-secondary-soft p-4 rounded-lg animate-fade-in">
                    <div className="text-lg font-['Comic_Neue'] font-bold text-secondary">
                      🗺️ Where: {selectedVehicles[currentVehicle].location}
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4 space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                        🚗
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age-appropriate hint */}
              {childAge <= 4 && !showDetails && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the vehicle to hear its sound and learn about it! 🎵
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedVehicles[currentVehicle] && !showDetails && (
          <Card className="mt-6 p-6 bg-primary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-primary mb-2">
              Did you know? 🤔
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              {selectedVehicles[currentVehicle].name}s help people travel from one place to another!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};