import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { soundEffects } from '@/utils/sounds';

interface FamilyTreeProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface FamilyMember {
  name: string;
  emoji: string;
  relationship: string;
  description: string;
}

const familyMembers: FamilyMember[] = [
  { name: 'Mom', emoji: '👩', relationship: 'Mother', description: 'Takes care of you and loves you!' },
  { name: 'Dad', emoji: '👨', relationship: 'Father', description: 'Protects and plays with you!' },
  { name: 'Sister', emoji: '👧', relationship: 'Sister', description: 'Your female sibling to play with!' },
  { name: 'Brother', emoji: '👦', relationship: 'Brother', description: 'Your male sibling to have fun with!' },
  { name: 'Grandma', emoji: '👵', relationship: 'Grandmother', description: 'Mom or Dad\'s mother who tells great stories!' },
  { name: 'Grandpa', emoji: '👴', relationship: 'Grandfather', description: 'Mom or Dad\'s father who gives warm hugs!' },
  { name: 'Aunt', emoji: '👩‍🦱', relationship: 'Aunt', description: 'Your parent\'s sister who spoils you!' },
  { name: 'Uncle', emoji: '👨‍🦲', relationship: 'Uncle', description: 'Your parent\'s brother who plays games!' },
  { name: 'Cousin', emoji: '🧒', relationship: 'Cousin', description: 'Your aunt or uncle\'s child, your playmate!' },
  { name: 'Baby', emoji: '👶', relationship: 'Baby', description: 'The youngest member of the family!' },
];

export const FamilyTree = ({ childAge, onComplete, onBack }: FamilyTreeProps) => {
  const [currentMember, setCurrentMember] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    // Ensure at least 8 family members for proper interaction
    const numMembers = Math.max(8, childAge <= 4 ? 8 : 10);
    setSelectedMembers(familyMembers.slice(0, Math.min(numMembers, familyMembers.length)));
  }, [childAge]);

  const handleMemberClick = async (member: FamilyMember) => {
    await soundEffects.playSuccess();
    setScore(prev => prev + 1);
    
    setTimeout(async () => {
      if (currentMember < selectedMembers.length - 1) {
        setCurrentMember(prev => prev + 1);
        await soundEffects.playClick();
      } else {
        await soundEffects.playCheer();
        setGameComplete(true);
      }
    }, 2000);
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / selectedMembers.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">👨‍👩‍👧‍👦</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-primary mb-4">
            Family Expert!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You learned about {selectedMembers.length} family members!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {selectedMembers.map((member, index) => (
              <div key={member.name} className="text-center">
                <div className="text-4xl mb-2 float" style={{ animationDelay: `${index * 0.2}s` }}>
                  {member.emoji}
                </div>
                <div className="font-['Comic_Neue'] font-bold text-sm">{member.name}</div>
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Wonderful! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Family Member {currentMember + 1} of {selectedMembers.length}
            </div>
            <Progress value={((currentMember + 1) / selectedMembers.length) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <h1 className="text-4xl font-['Fredoka_One'] text-primary mb-6">
            Family Tree! 👨‍👩‍👧‍👦
          </h1>
          
          {selectedMembers[currentMember] && (
            <div className="space-y-6">
              <p className="text-2xl font-['Comic_Neue'] text-muted-foreground mb-8">
                Click on {selectedMembers[currentMember].name} to learn about them!
              </p>

              <div 
                className="inline-block cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3"
                onClick={() => handleMemberClick(selectedMembers[currentMember])}
              >
                <div className="text-9xl mb-6 wiggle animate-bounce-slow">
                  {selectedMembers[currentMember].emoji}
                </div>
                
                <div className="text-4xl font-['Comic_Neue'] font-bold text-primary animate-pulse">
                  {selectedMembers[currentMember].name}
                </div>
                
                <div className="text-xl font-['Comic_Neue'] text-muted-foreground mt-4 animate-fade-in">
                  {selectedMembers[currentMember].description}
                </div>
                
                <div className="flex justify-center mt-6 space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                      💕
                    </div>
                  ))}
                </div>
              </div>

              {/* Age-appropriate hint */}
              {childAge <= 4 && (
                <div className="text-lg font-['Comic_Neue'] text-muted-foreground mt-6">
                  Tap the family member to learn about them! 💝
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Fun Facts for older children */}
        {childAge >= 5 && selectedMembers[currentMember] && (
          <Card className="mt-6 p-6 bg-secondary-soft">
            <h3 className="text-xl font-['Comic_Neue'] font-bold text-secondary mb-2">
              Family Fact! 💡
            </h3>
            <p className="font-['Comic_Neue'] text-muted-foreground">
              A {selectedMembers[currentMember].relationship.toLowerCase()} is a very important person in your family who loves you very much!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};