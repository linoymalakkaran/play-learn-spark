import React from 'react';
import { Child, Activity } from '@/types/learning';

// Import all activity components
import { 
  LazyAnimalSafari,
  LazyNumberGarden,
  LazyShapeDetective,
  LazyColorRainbow,
  LazyFamilyTree,
  LazyBodyParts,
  LazyWeatherStation,
  LazyCountingTrain,
  LazySizeSorter,
  LazyTransportation,
  LazyEmotionFaces,
  LazyPizzaFractions,
  LazyPetParade
} from '@/components/common/LazyLoadWrapper';
import { PlaceholderActivity } from '../activities/PlaceholderActivity';
import { FruitBasket } from '../activities/FruitBasket';
import { VegetableGarden } from '../activities/VegetableGarden';
import { ToyBox } from '../activities/ToyBox';
import { CommunityHelpers } from '../CommunityHelpers';
import { ClothingCloset } from '../ClothingCloset';
import { KitchenWords } from '../KitchenWords';
import { PlaygroundFun } from '../PlaygroundFun';

interface ActivityRouterProps {
  currentActivity: string;
  child: Child;
  activities: Activity[];
  onActivityComplete: (activityId: string, score: number) => void;
  onBack: () => void;
}

export const ActivityRouter: React.FC<ActivityRouterProps> = ({
  currentActivity,
  child,
  activities,
  onActivityComplete,
  onBack
}) => {
  const handleActivityComplete = (activityId: string, score: number) => {
    onActivityComplete(activityId, score);
  };

  // Render specific activity components
  switch (currentActivity) {
    case 'animal-safari':
      return (
        <LazyAnimalSafari
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('animal-safari', score)}
          onBack={onBack}
        />
      );

    case 'number-garden':
      return (
        <LazyNumberGarden
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('number-garden', score)}
          onBack={onBack}
        />
      );

    case 'shape-detective':
      return (
        <LazyShapeDetective
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('shape-detective', score)}
          onBack={onBack}
        />
      );

    case 'color-rainbow':
      return (
        <LazyColorRainbow
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('color-rainbow', score)}
          onBack={onBack}
        />
      );

    case 'family-tree':
      return (
        <LazyFamilyTree
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('family-tree', score)}
          onBack={onBack}
        />
      );

    case 'body-parts':
      return (
        <LazyBodyParts
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('body-parts', score)}
          onBack={onBack}
        />
      );

    case 'weather-station':
      return (
        <LazyWeatherStation
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('weather-station', score)}
          onBack={onBack}
        />
      );

    case 'counting-train':
      return (
        <LazyCountingTrain
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('counting-train', score)}
          onBack={onBack}
        />
      );

    case 'size-sorter':
      return (
        <LazySizeSorter
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('size-sorter', score)}
          onBack={onBack}
        />
      );

    case 'transportation':
      return (
        <LazyTransportation
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('transportation', score)}
          onBack={onBack}
        />
      );

    case 'emotion-faces':
      return (
        <LazyEmotionFaces
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('emotion-faces', score)}
          onBack={onBack}
        />
      );

    case 'pizza-fractions':
      return (
        <LazyPizzaFractions
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('pizza-fractions', score)}
          onBack={onBack}
        />
      );

    case 'pet-parade':
      return (
        <LazyPetParade
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('pet-parade', score)}
          onBack={onBack}
        />
      );

    case 'fruit-basket':
      return (
        <FruitBasket
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('fruit-basket', score)}
          onBack={onBack}
        />
      );

    case 'vegetable-garden':
      return (
        <VegetableGarden
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('vegetable-garden', score)}
          onBack={onBack}
        />
      );

    case 'toy-box':
      return (
        <ToyBox
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('toy-box', score)}
          onBack={onBack}
        />
      );

    case 'community-helpers':
      return (
        <CommunityHelpers
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('community-helpers', score)}
          onBack={onBack}
        />
      );

    case 'clothing-closet':
      return (
        <ClothingCloset
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('clothing-closet', score)}
          onBack={onBack}
        />
      );

    case 'kitchen-words':
      return (
        <KitchenWords
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('kitchen-words', score)}
          onBack={onBack}
        />
      );

    case 'playground-fun':
      return (
        <PlaygroundFun
          childAge={child.age}
          onComplete={(score) => handleActivityComplete('playground-fun', score)}
          onBack={onBack}
        />
      );

    default:
      // Handle all other activities with interactive placeholder
      const activity = activities.find(a => a.id === currentActivity);
      if (activity) {
        return (
          <PlaceholderActivity
            childAge={child.age}
            onComplete={(score) => handleActivityComplete(currentActivity, score)}
            onBack={onBack}
            activityName={activity.title}
            activityIcon={activity.icon}
            activityDescription={activity.description}
            activityCategory={activity.category}
          />
        );
      }
      
      return null;
  }
};

export default ActivityRouter;