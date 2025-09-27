import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import { useState, useEffect } from 'react';

interface PlaceholderActivityProps {
  childAge: 3 | 4 | 5 | 6;
  onComplete: (score: number) => void;
  onBack: () => void;
  activityName: string;
  activityIcon: string;
  activityDescription: string;
  activityCategory: 'english' | 'math' | 'science' | 'habits' | 'art' | 'social' | 'problem' | 'physical' | 'world';
}

interface QuickTask {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  completed: boolean;
}

export const PlaceholderActivity = ({ 
  childAge, 
  onComplete, 
  onBack, 
  activityName, 
  activityIcon, 
  activityDescription,
  activityCategory 
}: PlaceholderActivityProps) => {
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    const numTasks = 8;
    const newTasks: QuickTask[] = [];
    
    if (activityCategory === 'math') {
      // Generate different types of math activities based on activity name
      const mathActivities = {
        'addition-park': () => generateArithmeticTasks('addition'),
        'subtraction-store': () => generateArithmeticTasks('subtraction'),
        'multiplication': () => generateArithmeticTasks('multiplication'),
        'division': () => generateArithmeticTasks('division'),
        'pattern-maker': () => generatePatternTasks(),
        'clock-time': () => generateTimeTasks(),
        'money-count': () => generateMoneyTasks(),
        'height-measure': () => generateMeasurementTasks(),
        'weight-balance': () => generateComparisonTasks(),
        'graph-fun': () => generateDataTasks(),
        'calendar-days': () => generateCalendarTasks(),
        'number-line': () => generateNumberLineTasks(),
        'sorting-bins': () => generateSortingTasks(),
        'dice-games': () => generateDiceTasks(),
        'puzzle-pieces': () => generatePuzzleTasks(),
        'birthday-candles': () => generateCountingTasks(),
        'treasure-hunt': () => generateHuntTasks(),
        'cookie-jar': () => generateSharingTasks(),
        'flower-beds': () => generateArrayTasks(),
        'building-blocks': () => generateStackingTasks(),
        'button-sort': () => generateClassificationTasks(),
        'race-track': () => generateOrdinalTasks(),
        'weather-graph': () => generateWeatherDataTasks(),
        'mirror-symmetry': () => generateSymmetryTasks(),
        'jump-count': () => generateSkipCountingTasks(),
        'nest-eggs': () => generateCountingTasks(),
        'balloon-pop': () => generateSubtractionTasks()
      };

      const activityGenerator = mathActivities[activityName] || (() => generateArithmeticTasks('addition'));
      
      function generateArithmeticTasks(operation: string) {
        const tasks = [];
        for (let i = 0; i < numTasks; i++) {
          let question, correctAnswer, num1, num2;
          
          switch (operation) {
            case 'addition':
              num1 = Math.floor(Math.random() * 8) + 1;
              num2 = Math.floor(Math.random() * 8) + 1;
              correctAnswer = num1 + num2;
              question = `${num1} + ${num2} = ?`;
              break;
            case 'subtraction':
              num1 = Math.floor(Math.random() * 10) + 5;
              num2 = Math.floor(Math.random() * num1) + 1;
              correctAnswer = num1 - num2;
              question = `${num1} - ${num2} = ?`;
              break;
            case 'multiplication':
              num1 = Math.floor(Math.random() * 5) + 1;
              num2 = Math.floor(Math.random() * 5) + 1;
              correctAnswer = num1 * num2;
              question = `${num1} × ${num2} = ?`;
              break;
            case 'division':
              correctAnswer = Math.floor(Math.random() * 8) + 1;
              num2 = Math.floor(Math.random() * 5) + 1;
              num1 = correctAnswer * num2;
              question = `${num1} ÷ ${num2} = ?`;
              break;
            default:
              num1 = Math.floor(Math.random() * 5) + 1;
              num2 = Math.floor(Math.random() * 5) + 1;
              correctAnswer = num1 + num2;
              question = `${num1} + ${num2} = ?`;
          }
          
          const wrongAnswers = [
            correctAnswer + 1,
            correctAnswer - 1,
            correctAnswer + 2
          ].filter(n => n > 0 && n !== correctAnswer).slice(0, 2);
          
          const options = [correctAnswer, ...wrongAnswers]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          
          tasks.push({
            id: i,
            question,
            options: options.map(String),
            correctAnswer: options.indexOf(correctAnswer),
            completed: false
          });
        }
        return tasks;
      }

      function generatePatternTasks() {
        const patterns = [
          { sequence: ['🔴', '🔵', '🔴', '🔵', '?'], answer: '🔴', options: ['🔴', '🔵', '🟡'] },
          { sequence: ['⭐', '⭐', '🌙', '⭐', '⭐', '?'], answer: '🌙', options: ['🌙', '⭐', '☀️'] },
          { sequence: ['🟢', '🟡', '🔴', '🟢', '🟡', '?'], answer: '🔴', options: ['🔴', '🟢', '🟡'] },
          { sequence: ['📐', '📐', '📏', '📐', '📐', '?'], answer: '📏', options: ['📏', '📐', '📊'] },
          { sequence: ['🎵', '🎶', '🎵', '🎶', '?'], answer: '🎵', options: ['🎵', '🎶', '🎤'] },
          { sequence: ['🌸', '🌻', '🌸', '🌻', '?'], answer: '🌸', options: ['🌸', '🌻', '🌷'] },
          { sequence: ['🍎', '🍊', '🍎', '🍊', '?'], answer: '🍎', options: ['🍎', '🍊', '🍌'] },
          { sequence: ['🚗', '🚙', '🚗', '🚙', '?'], answer: '🚗', options: ['🚗', '🚙', '🚕'] }
        ];
        
        return patterns.slice(0, numTasks).map((pattern, i) => ({
          id: i,
          question: `What comes next? ${pattern.sequence.join(' ')}`,
          options: pattern.options,
          correctAnswer: pattern.options.indexOf(pattern.answer),
          completed: false
        }));
      }

      function generateTimeTasks() {
        const times = [
          { clock: '🕐', time: '1:00', options: ['1:00', '2:00', '12:00'] },
          { clock: '🕕', time: '6:00', options: ['6:00', '5:00', '7:00'] },
          { clock: '🕒', time: '3:00', options: ['3:00', '4:00', '2:00'] },
          { clock: '🕘', time: '9:00', options: ['9:00', '8:00', '10:00'] },
          { clock: '🕙', time: '10:00', options: ['10:00', '11:00', '9:00'] },
          { clock: '🕛', time: '12:00', options: ['12:00', '1:00', '11:00'] },
          { clock: '🕓', time: '4:00', options: ['4:00', '3:00', '5:00'] },
          { clock: '🕗', time: '8:00', options: ['8:00', '7:00', '9:00'] }
        ];
        
        return times.slice(0, numTasks).map((timeData, i) => ({
          id: i,
          question: `What time does this clock show? ${timeData.clock}`,
          options: timeData.options,
          correctAnswer: 0,
          completed: false
        }));
      }

      function generateMoneyTasks() {
        const coins = [
          { question: 'How much is this worth? 🪙', answer: '1¢', options: ['1¢', '5¢', '10¢'] },
          { question: 'How much is this worth? 🪙🪙🪙', answer: '3¢', options: ['3¢', '2¢', '5¢'] },
          { question: 'Which costs more? 🍎(5¢) or 🍌(3¢)?', answer: '🍎', options: ['🍎', '🍌', 'Same'] },
          { question: 'Count the coins: 🪙🪙🪙🪙🪙', answer: '5¢', options: ['5¢', '4¢', '6¢'] },
          { question: 'How much money? 🪙🪙', answer: '2¢', options: ['2¢', '1¢', '3¢'] },
          { question: 'Which is less? 7¢ or 4¢?', answer: '4¢', options: ['4¢', '7¢', 'Same'] },
          { question: 'Total coins: 🪙🪙🪙🪙', answer: '4¢', options: ['4¢', '3¢', '5¢'] },
          { question: 'Most expensive? 🧸(8¢) 🚗(6¢) ⚽(9¢)', answer: '⚽', options: ['⚽', '🧸', '🚗'] }
        ];
        
        return coins.slice(0, numTasks).map((coin, i) => ({
          id: i,
          question: coin.question,
          options: coin.options,
          correctAnswer: coin.options.indexOf(coin.answer),
          completed: false
        }));
      }

      function generateMeasurementTasks() {
        const measurements = [
          { question: 'Which is taller? 🏢 or 🏠?', answer: '🏢', options: ['🏢', '🏠', 'Same'] },
          { question: 'Which is longer? 🚂 or 🚗?', answer: '🚂', options: ['🚂', '🚗', 'Same'] },
          { question: 'Which is bigger? 🐘 or 🐁?', answer: '🐘', options: ['🐘', '🐁', 'Same'] },
          { question: 'Which is shorter? 📏 or ✏️?', answer: '✏️', options: ['✏️', '📏', 'Same'] },
          { question: 'Which is smaller? 🏀 or ⚽?', answer: '⚽', options: ['⚽', '🏀', 'Same'] },
          { question: 'Which is wider? 🛣️ or 🛤️?', answer: '🛣️', options: ['🛣️', '🛤️', 'Same'] },
          { question: 'Which is thinner? 🥞 or 🍰?', answer: '🥞', options: ['🥞', '🍰', 'Same'] },
          { question: 'Which is thicker? 📚 or 📄?', answer: '📚', options: ['📚', '📄', 'Same'] }
        ];
        
        return measurements.slice(0, numTasks).map((measure, i) => ({
          id: i,
          question: measure.question,
          options: measure.options,
          correctAnswer: measure.options.indexOf(measure.answer),
          completed: false
        }));
      }

      // Add more activity generators with default fallback
      function generateComparisonTasks() {
        return generateMeasurementTasks();
      }

      function generateCalendarTasks() {
        const days = [
          { question: 'How many days in a week?', answer: '7', options: ['7', '5', '6'] },
          { question: 'Which comes after Monday?', answer: 'Tuesday', options: ['Tuesday', 'Sunday', 'Wednesday'] },
          { question: 'Which day starts the week?', answer: 'Sunday', options: ['Sunday', 'Monday', 'Tuesday'] },
          { question: 'How many months in a year?', answer: '12', options: ['12', '10', '11'] },
          { question: 'Which comes before Friday?', answer: 'Thursday', options: ['Thursday', 'Saturday', 'Wednesday'] },
          { question: 'Weekend days count?', answer: '2', options: ['2', '3', '1'] },
          { question: 'First month of year?', answer: 'January', options: ['January', 'February', 'March'] },
          { question: 'Last day of week?', answer: 'Saturday', options: ['Saturday', 'Friday', 'Sunday'] }
        ];
        
        return days.slice(0, numTasks).map((day, i) => ({
          id: i,
          question: day.question,
          options: day.options,
          correctAnswer: 0,
          completed: false
        }));
      }

      // Specific generators for each activity type
      function generateNumberLineTasks() {
        const tasks = [
          { question: 'Which number comes after 5? 🦘', answer: '6', options: ['6', '4', '7'] },
          { question: 'What number is between 3 and 5? 🦘', answer: '4', options: ['4', '2', '6'] },
          { question: 'Count backwards from 5: 5, 4, ?, 2', answer: '3', options: ['3', '1', '4'] },
          { question: 'Which is bigger: 7 or 4? 🦘', answer: '7', options: ['7', '4', 'Same'] },
          { question: 'What comes before 8? 🦘', answer: '7', options: ['7', '9', '6'] },
          { question: 'Count up: 1, 2, 3, ? 🦘', answer: '4', options: ['4', '5', '2'] },
          { question: 'Which is smaller: 9 or 6? 🦘', answer: '6', options: ['6', '9', 'Same'] },
          { question: 'What number is missing? 2, ?, 4 🦘', answer: '3', options: ['3', '1', '5'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateSortingTasks() {
        const tasks = [
          { question: 'Sort by size: Which is biggest? 🗂️', answer: '🐘', options: ['🐘', '🐁', '🐱'] },
          { question: 'Sort by color: Group the reds 🗂️', answer: '🔴', options: ['🔴', '🔵', '🟡'] },
          { question: 'Which belongs with fruits? 🗂️', answer: '🍎', options: ['🍎', '🚗', '📚'] },
          { question: 'Sort animals: Which is a bird? 🗂️', answer: '🐦', options: ['🐦', '🐱', '🐶'] },
          { question: 'Group by shape: Which is round? 🗂️', answer: '⚽', options: ['⚽', '📱', '📚'] },
          { question: 'Sort by home: Where do fish live? 🗂️', answer: '🌊', options: ['🌊', '🏠', '🌳'] },
          { question: 'Which is a vehicle? 🗂️', answer: '🚗', options: ['🚗', '🍎', '🌸'] },
          { question: 'Sort by weather: What shows rain? 🗂️', answer: '🌧️', options: ['🌧️', '☀️', '❄️'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateDiceTasks() {
        const tasks = [
          { question: 'Roll the dice! How many dots? ⚀', answer: '1', options: ['1', '2', '3'] },
          { question: 'Count the dots on dice: ⚂', answer: '3', options: ['3', '2', '4'] },
          { question: 'Two dice: ⚀ + ⚁ = ?', answer: '3', options: ['3', '2', '4'] },
          { question: 'Which dice shows 4? 🎲', answer: '⚃', options: ['⚃', '⚁', '⚄'] },
          { question: 'Count all dots: ⚁ + ⚁ = ?', answer: '4', options: ['4', '3', '5'] },
          { question: 'Highest number on dice: ⚅', answer: '6', options: ['6', '5', '4'] },
          { question: 'Three dice: ⚀ + ⚀ + ⚀ = ?', answer: '3', options: ['3', '2', '4'] },
          { question: 'Which is more? ⚄ or ⚂', answer: '⚄', options: ['⚄', '⚂', 'Same'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generatePuzzleTasks() {
        const tasks = [
          { question: 'Complete the puzzle: 🧩 How many pieces?', answer: '4', options: ['4', '3', '5'] },
          { question: 'Puzzle corners: How many? 🧩', answer: '4', options: ['4', '3', '6'] },
          { question: 'Missing piece: What fits? 🧩', answer: '🟦', options: ['🟦', '🔴', '⭐'] },
          { question: 'Jigsaw count: 🧩🧩🧩 = ?', answer: '3', options: ['3', '2', '4'] },
          { question: 'Puzzle rows: How many lines? 🧩', answer: '2', options: ['2', '1', '3'] },
          { question: 'Edge pieces vs middle? More of which? 🧩', answer: 'Edge', options: ['Edge', 'Middle', 'Same'] },
          { question: 'Complete set: 🧩🧩🧩🧩🧩 = ?', answer: '5', options: ['5', '4', '6'] },
          { question: 'Puzzle shape: What do you make? 🧩', answer: '🖼️', options: ['🖼️', '⚽', '📱'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateCountingTasks() {
        const tasks = [
          { question: 'Count the stars: ⭐⭐⭐⭐', answer: '4', options: ['4', '3', '5'] },
          { question: 'How many hearts? 💖💖💖', answer: '3', options: ['3', '2', '4'] },
          { question: 'Count flowers: 🌸🌸🌸🌸🌸', answer: '5', options: ['5', '4', '6'] },
          { question: 'Animals total: 🐱🐶🐭', answer: '3', options: ['3', '2', '4'] },
          { question: 'Count balloons: 🎈🎈', answer: '2', options: ['2', '1', '3'] },
          { question: 'How many trees? 🌳🌳🌳🌳🌳🌳', answer: '6', options: ['6', '5', '7'] },
          { question: 'Count cars: 🚗🚙🚕', answer: '3', options: ['3', '2', '4'] },
          { question: 'Total books: 📚📕📗📘', answer: '4', options: ['4', '3', '5'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateHuntTasks() {
        const tasks = [
          { question: 'Find all treasures! 💎💎💎 Count them:', answer: '3', options: ['3', '2', '4'] },
          { question: 'Hunt for gold! 🪙🪙🪙🪙🪙 Total:', answer: '5', options: ['5', '4', '6'] },
          { question: 'Gems found: 💍💍 How many?', answer: '2', options: ['2', '1', '3'] },
          { question: 'Hidden stars: ⭐⭐⭐⭐ Count:', answer: '4', options: ['4', '3', '5'] },
          { question: 'Treasure chest: 💰💰💰💰💰💰 Total:', answer: '6', options: ['6', '5', '7'] },
          { question: 'Diamond hunt: 💎 + 💎 = ?', answer: '2', options: ['2', '1', '3'] },
          { question: 'Keys found: 🗝️🗝️🗝️ How many?', answer: '3', options: ['3', '2', '4'] },
          { question: 'Map pieces: 🗺️🗺️🗺️🗺️ Count:', answer: '4', options: ['4', '3', '5'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateStackingTasks() {
        const tasks = [
          { question: 'Stack blocks: 🧱🧱🧱 How many levels?', answer: '3', options: ['3', '2', '4'] },
          { question: 'Tower height: 🧱 on 🧱 on 🧱 = ?', answer: '3', options: ['3', '2', '4'] },
          { question: 'Building blocks: Add 2 more to 🧱🧱', answer: '4', options: ['4', '3', '5'] },
          { question: 'Stack cups: ☕☕☕☕ How many?', answer: '4', options: ['4', '3', '5'] },
          { question: 'Toy tower: 🪀🪀 + 🪀 = ?', answer: '3', options: ['3', '2', '4'] },
          { question: 'Box stack: 📦📦📦📦📦 Count:', answer: '5', options: ['5', '4', '6'] },
          { question: 'Book pile: 📚📚 How many books?', answer: '2', options: ['2', '1', '3'] },
          { question: 'Ring tower: 🔴🔵🟡 How many rings?', answer: '3', options: ['3', '2', '4'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateClassificationTasks() {
        return generateSortingTasks();
      }

      function generateOrdinalTasks() {
        const tasks = [
          { question: 'Race positions: Who is 1st? 🥇🥈🥉', answer: '🥇', options: ['🥇', '🥈', '🥉'] },
          { question: 'Line order: Who is 2nd? 👦👧👶', answer: '👧', options: ['👧', '👦', '👶'] },
          { question: 'Finish line: What comes after 1st? 🏁', answer: '2nd', options: ['2nd', '3rd', '4th'] },
          { question: 'Steps: Which is the 3rd step? 1️⃣2️⃣3️⃣', answer: '3️⃣', options: ['3️⃣', '1️⃣', '2️⃣'] },
          { question: 'Queue: Who is last? 🧑👩👨', answer: '👨', options: ['👨', '🧑', '👩'] },
          { question: 'Medals: What is 3rd place? 🏆', answer: '🥉', options: ['🥉', '🥇', '🥈'] },
          { question: 'Alphabet: What comes after A? 🔤', answer: 'B', options: ['B', 'C', 'Z'] },
          { question: 'Numbers: What is between 1st and 3rd? 🏁', answer: '2nd', options: ['2nd', '4th', '1st'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateWeatherDataTasks() {
        const tasks = [
          { question: 'Sunny days this week: ☀️☀️☀️ Count:', answer: '3', options: ['3', '2', '4'] },
          { question: 'Rainy vs sunny: ☀️☀️ 🌧️ Which more?', answer: '☀️', options: ['☀️', '🌧️', 'Same'] },
          { question: 'Temperature: Which is hotter? 🔥 or ❄️', answer: '🔥', options: ['🔥', '❄️', 'Same'] },
          { question: 'Weather count: ☀️🌧️❄️ Total types:', answer: '3', options: ['3', '2', '4'] },
          { question: 'Cloudy days: ☁️☁️☁️☁️ How many?', answer: '4', options: ['4', '3', '5'] },
          { question: 'Storm total: ⛈️⛈️ Count storms:', answer: '2', options: ['2', '1', '3'] },
          { question: 'Snow days: ❄️❄️❄️❄️❄️ How many?', answer: '5', options: ['5', '4', '6'] },
          { question: 'Windy weather: 💨💨💨 Count wind:', answer: '3', options: ['3', '2', '4'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateSymmetryTasks() {
        const tasks = [
          { question: 'Mirror match: Which reflects 🦋?', answer: '🦋', options: ['🦋', '🐛', '🕷️'] },
          { question: 'Symmetry: Complete the pattern ⬜🔴', answer: '🔴⬜', options: ['🔴⬜', '⬜⬜', '🔴🔴'] },
          { question: 'Face symmetry: Mirror 😊', answer: '😊', options: ['😊', '🙃', '😢'] },
          { question: 'Shape match: Reflect ⭐', answer: '⭐', options: ['⭐', '🔵', '📐'] },
          { question: 'Half and half: Complete 🟦⬜', answer: '⬜🟦', options: ['⬜🟦', '🟦🟦', '⬜⬜'] },
          { question: 'Mirror line: Which is symmetric? 🪞', answer: '♥️', options: ['♥️', '🍌', '🌙'] },
          { question: 'Fold test: Which folds evenly?', answer: '🔴', options: ['🔴', '🥐', '🍕'] },
          { question: 'Reflection: Mirror image of A?', answer: 'A', options: ['A', 'B', 'C'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateSkipCountingTasks() {
        const tasks = [
          { question: 'Count by 2s: 2, 4, 6, ?', answer: '8', options: ['8', '7', '9'] },
          { question: 'Skip count by 5s: 5, 10, ?', answer: '15', options: ['15', '12', '20'] },
          { question: 'Count by 10s: 10, 20, ?', answer: '30', options: ['30', '25', '40'] },
          { question: 'Jump by 2s: 🦘🦘 = 2, 4, ?', answer: '6', options: ['6', '5', '7'] },
          { question: 'Pairs: 👫👫 = ? people', answer: '4', options: ['4', '2', '6'] },
          { question: 'Hands: ✋✋ = ? fingers', answer: '10', options: ['10', '8', '5'] },
          { question: 'Wheels: 🚲🚲 = ? wheels', answer: '4', options: ['4', '2', '6'] },
          { question: 'Eyes: 👀👀👀 = ? eyes', answer: '6', options: ['6', '4', '8'] }
        ];
        return tasks.slice(0, numTasks).map((task, i) => ({ ...task, id: i, completed: false }));
      }

      function generateSubtractionTasks() {
        return generateArithmeticTasks('subtraction');
      }

      function generateSharingTasks() {
        return generateArithmeticTasks('division');
      }

      function generateArrayTasks() {
        return generateArithmeticTasks('multiplication');
      }

      function generateDataTasks() {
        return generateWeatherDataTasks();
      }

      const generatedTasks = activityGenerator();
      setTasks(generatedTasks);
    } else if (activityCategory === 'english') {
      // Generate English vocabulary tasks  
      const newTasks: QuickTask[] = [];
      const vocabularyWords = [
        { word: 'Happy', options: ['😊', '😢', '😡'], correct: 0 },
        { word: 'Cat', options: ['🐱', '🐶', '🐭'], correct: 0 },
        { word: 'Red', options: ['🔴', '🔵', '🟢'], correct: 0 },
        { word: 'Big', options: ['🐘', '🐜', '🐱'], correct: 0 },
        { word: 'Sun', options: ['☀️', '🌙', '⭐'], correct: 0 },
        { word: 'Car', options: ['🚗', '🚁', '🚢'], correct: 0 },
        { word: 'Tree', options: ['🌳', '🌸', '🍄'], correct: 0 },
        { word: 'Book', options: ['📚', '✏️', '📱'], correct: 0 },
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const wordData = vocabularyWords[i % vocabularyWords.length];
        const shuffledOptions = [...wordData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(wordData.options[wordData.correct]);
        
        newTasks.push({
          id: i,
          question: `Which picture shows "${wordData.word}"?`,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    } else if (activityCategory === 'science') {
      // Generate science tasks
      const newTasks: QuickTask[] = [];
      const scienceQuestions = [
        { question: 'What do plants need to grow?', answer: 'Water', options: ['Water', 'Music', 'Toys'] },
        { question: 'What color is the sun?', answer: 'Yellow', options: ['Yellow', 'Blue', 'Green'] },
        { question: 'How many legs does a spider have?', answer: '8', options: ['8', '6', '4'] },
        { question: 'What do we breathe?', answer: 'Air', options: ['Air', 'Water', 'Food'] },
        { question: 'What makes things fall down?', answer: 'Gravity', options: ['Gravity', 'Wind', 'Magic'] }
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const scienceData = scienceQuestions[i % scienceQuestions.length];
        const shuffledOptions = [...scienceData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(scienceData.answer);
        
        newTasks.push({
          id: i,
          question: scienceData.question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    } else if (activityCategory === 'habits') {
      // Generate Good habits tasks
      const newTasks: QuickTask[] = [];
      const habitQuestions = [
        { question: 'When should you wash your hands? 🧼', answer: 'Before eating', options: ['Before eating', 'Never', 'Once a week'] },
        { question: 'How often brush your teeth? 🦷', answer: 'Twice daily', options: ['Twice daily', 'Once a month', 'Never'] },
        { question: 'What do you say when someone helps you?', answer: 'Thank you', options: ['Thank you', 'Go away', 'Nothing'] },
        { question: 'Which foods are healthy? 🥗', answer: 'Vegetables', options: ['Vegetables', 'Only candy', 'Just chips'] },
        { question: 'When crossing the street, you should:', answer: 'Look both ways', options: ['Look both ways', 'Run fast', 'Close eyes'] },
        { question: 'Before bed, you should:', answer: 'Brush teeth', options: ['Brush teeth', 'Eat candy', 'Stay awake'] },
        { question: 'What do you say when you want something?', answer: 'Please', options: ['Please', 'Give me now', 'Nothing'] },
        { question: 'How much water should you drink? 💧', answer: 'Lots daily', options: ['Lots daily', 'None', 'Very little'] }
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const habitData = habitQuestions[i % habitQuestions.length];
        const shuffledOptions = [...habitData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(habitData.answer);
        
        newTasks.push({
          id: i,
          question: habitData.question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    } else if (activityCategory === 'art') {
      // Generate Art & Creativity tasks
      const newTasks: QuickTask[] = [];
      const artQuestions = [
        { question: 'What do you use to paint? 🎨', answer: 'Brush', options: ['Brush', 'Fork', 'Spoon'] },
        { question: 'Mix red and yellow to get:', answer: 'Orange', options: ['Orange', 'Purple', 'Green'] },
        { question: 'What instrument has keys? 🎹', answer: 'Piano', options: ['Piano', 'Drum', 'Flute'] },
        { question: 'What do you use to cut paper? ✂️', answer: 'Scissors', options: ['Scissors', 'Spoon', 'Crayon'] },
        { question: 'Which is used for drawing? ✏️', answer: 'Pencil', options: ['Pencil', 'Hammer', 'Plate'] },
        { question: 'What makes music when you hit it? 🥁', answer: 'Drum', options: ['Drum', 'Book', 'Chair'] },
        { question: 'What do you fold to make origami? 🗾', answer: 'Paper', options: ['Paper', 'Metal', 'Glass'] },
        { question: 'Which creates colorful art? 🌈', answer: 'Crayons', options: ['Crayons', 'Rocks', 'Water'] }
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const artData = artQuestions[i % artQuestions.length];
        const shuffledOptions = [...artData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(artData.answer);
        
        newTasks.push({
          id: i,
          question: artData.question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    } else if (activityCategory === 'social') {
      // Generate Social Skills tasks
      const newTasks: QuickTask[] = [];
      const socialQuestions = [
        { question: 'When someone is sad, you should:', answer: 'Be kind', options: ['Be kind', 'Laugh at them', 'Ignore them'] },
        { question: 'How do you make friends? 👫', answer: 'Be nice', options: ['Be nice', 'Be mean', 'Be scary'] },
        { question: 'When you want to play with others:', answer: 'Ask nicely', options: ['Ask nicely', 'Take their toys', 'Push them'] },
        { question: 'If someone helps you, say:', answer: 'Thank you', options: ['Thank you', 'Go away', 'Nothing'] },
        { question: 'When friends disagree, you should:', answer: 'Talk it out', options: ['Talk it out', 'Fight', 'Run away'] },
        { question: 'How do you show you care? ❤️', answer: 'Give hugs', options: ['Give hugs', 'Be mean', 'Hide'] },
        { question: 'When someone is talking, you:', answer: 'Listen', options: ['Listen', 'Interrupt', 'Leave'] },
        { question: 'What makes a good friend?', answer: 'Being kind', options: ['Being kind', 'Being selfish', 'Being rude'] }
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const socialData = socialQuestions[i % socialQuestions.length];
        const shuffledOptions = [...socialData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(socialData.answer);
        
        newTasks.push({
          id: i,
          question: socialData.question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    } else if (activityCategory === 'problem') {
      // Generate Problem Solving tasks
      const newTasks: QuickTask[] = [];
      const problemQuestions = [
        { question: 'If you lose your toy, you should:', answer: 'Look for it', options: ['Look for it', 'Cry loudly', 'Give up'] },
        { question: 'What comes next? 🔵🔴🔵🔴?', answer: '🔵', options: ['🔵', '🟡', '🟢'] },
        { question: 'To solve a puzzle, you need:', answer: 'Patience', options: ['Patience', 'Speed', 'Anger'] },
        { question: 'If something is broken, you can:', answer: 'Try to fix it', options: ['Try to fix it', 'Throw it away', 'Hide it'] },
        { question: 'Which doesn\'t belong? 🐶🐱🐭🚗', answer: '🚗', options: ['🚗', '🐶', '🐱'] },
        { question: 'To find a solution, first:', answer: 'Think', options: ['Think', 'Guess', 'Give up'] },
        { question: 'If you can\'t reach something high:', answer: 'Ask for help', options: ['Ask for help', 'Climb dangerously', 'Give up'] },
        { question: 'What helps solve mazes? 🗺️', answer: 'Following paths', options: ['Following paths', 'Running fast', 'Closing eyes'] }
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const problemData = problemQuestions[i % problemQuestions.length];
        const shuffledOptions = [...problemData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(problemData.answer);
        
        newTasks.push({
          id: i,
          question: problemData.question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    } else if (activityCategory === 'physical') {
      // Generate Physical Activity tasks
      const newTasks: QuickTask[] = [];
      const physicalQuestions = [
        { question: 'Before exercising, you should:', answer: 'Warm up', options: ['Warm up', 'Eat lots', 'Sleep'] },
        { question: 'Which is good exercise? 🏃‍♂️', answer: 'Running', options: ['Running', 'Sitting', 'Lying down'] },
        { question: 'To stay flexible, you should:', answer: 'Stretch', options: ['Stretch', 'Stay still', 'Sleep more'] },
        { question: 'Playing sports helps you:', answer: 'Stay healthy', options: ['Stay healthy', 'Get tired', 'Feel bad'] },
        { question: 'How do you catch a ball? ⚽', answer: 'With your hands', options: ['With your hands', 'With your feet', 'With your head'] },
        { question: 'Dancing helps improve your:', answer: 'Coordination', options: ['Coordination', 'Sadness', 'Sleepiness'] },
        { question: 'After exercising, you should:', answer: 'Drink water', options: ['Drink water', 'Eat candy', 'Take a nap'] },
        { question: 'Balance means:', answer: 'Not falling', options: ['Not falling', 'Running fast', 'Jumping high'] }
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const physicalData = physicalQuestions[i % physicalQuestions.length];
        const shuffledOptions = [...physicalData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(physicalData.answer);
        
        newTasks.push({
          id: i,
          question: physicalData.question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    } else if (activityCategory === 'world') {
      // Generate World Explorer tasks
      const newTasks: QuickTask[] = [];
      const worldQuestions = [
        { question: 'Which continent has pandas? 🐼', answer: 'Asia', options: ['Asia', 'Africa', 'Europe'] },
        { question: 'The Eiffel Tower is in:', answer: 'France', options: ['France', 'Japan', 'Brazil'] },
        { question: 'Which animal is from Australia? 🦘', answer: 'Kangaroo', options: ['Kangaroo', 'Lion', 'Penguin'] },
        { question: 'People in Mexico speak:', answer: 'Spanish', options: ['Spanish', 'French', 'German'] },
        { question: 'Which is the biggest ocean? 🌊', answer: 'Pacific', options: ['Pacific', 'Atlantic', 'Indian'] },
        { question: 'Pizza originally comes from:', answer: 'Italy', options: ['Italy', 'China', 'India'] },
        { question: 'The Great Wall is in:', answer: 'China', options: ['China', 'Egypt', 'Peru'] },
        { question: 'Which continent is very cold? 🐧', answer: 'Antarctica', options: ['Antarctica', 'Africa', 'Asia'] }
      ];
      
      for (let i = 0; i < numTasks; i++) {
        const worldData = worldQuestions[i % worldQuestions.length];
        const shuffledOptions = [...worldData.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(worldData.answer);
        
        newTasks.push({
          id: i,
          question: worldData.question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          completed: false
        });
      }
      
      setTasks(newTasks);
    }
  }, [activityCategory, activityName]);

  const handleAnswerSelect = async (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const currentTaskData = tasks[currentTask];
    
    if (answerIndex === currentTaskData.correctAnswer) {
      await soundEffects.playSuccess();
      setScore(prev => prev + 1);
      setShowFeedback(true);
      
      const updatedTasks = [...tasks];
      updatedTasks[currentTask].completed = true;
      setTasks(updatedTasks);
      
      setTimeout(async () => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        
        if (currentTask < tasks.length - 1) {
          setCurrentTask(prev => prev + 1);
          await soundEffects.playClick();
        } else {
          await soundEffects.playCheer();
          setGameComplete(true);
        }
      }, 2000);
    } else {
      await soundEffects.playError();
      setTimeout(() => {
        setSelectedAnswer(null);
      }, 1000);
    }
  };

  const handleComplete = () => {
    const finalScore = Math.round((score / tasks.length) * 100);
    onComplete(finalScore);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-soft via-secondary-soft to-magic-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center bounce-in">
          <div className="text-8xl mb-6 celebrate">{activityIcon}</div>
          <h1 className="text-4xl font-['Fredoka_One'] text-primary mb-4">
            {activityName} Complete!
          </h1>
          <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
            You completed all {tasks.length} challenges! Great job!
          </p>
          
          <div className="flex justify-center space-x-2 mb-8">
            {[...Array(Math.min(8, tasks.length))].map((_, i) => (
              <div key={i} className={`text-2xl animate-bounce`} style={{animationDelay: `${i * 0.1}s`}}>
                ⭐
              </div>
            ))}
          </div>

          <Button onClick={handleComplete} className="hero-button mr-4">
            Excellent! 🌟
          </Button>
          <Button onClick={onBack} variant="outline" className="px-6 py-3 font-['Comic_Neue'] font-bold">
            More Adventures
          </Button>
        </Card>
      </div>
    );
  }

  const currentTaskData = tasks[currentTask];

  if (!currentTaskData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-soft via-secondary-soft to-magic-soft flex items-center justify-center">
        <div className="text-6xl animate-spin">{activityIcon}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-secondary-soft to-magic-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="px-4 py-2 font-['Comic_Neue'] font-bold">
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-['Comic_Neue'] font-bold">
              Challenge {currentTask + 1} of {tasks.length}
            </div>
          </div>
        </div>

        {/* Main Activity */}
        <Card className="p-8 text-center activity-card">
          <div className="text-6xl mb-4 float">
            {activityIcon}
          </div>
          
          <h1 className="text-3xl font-['Fredoka_One'] text-primary mb-4">
            {activityName}
          </h1>
          
          <p className="text-lg font-['Comic_Neue'] text-muted-foreground mb-6">
            {activityDescription}
          </p>

          <div className="space-y-6">
            <p className="text-2xl font-['Comic_Neue'] font-bold text-foreground animate-pulse">
              {currentTaskData.question}
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {currentTaskData.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  variant={selectedAnswer === index ? 
                    (selectedAnswer === currentTaskData.correctAnswer ? "default" : "destructive")
                    : "outline"
                  }
                  className={`
                    w-20 h-20 text-2xl font-bold font-['Comic_Neue'] rounded-full
                    transition-all duration-300 hover:scale-110 hover:shadow-lg
                    ${selectedAnswer === index && selectedAnswer === currentTaskData.correctAnswer
                      ? 'bg-gradient-to-r from-success to-secondary text-white animate-bounce'
                      : selectedAnswer === index
                      ? 'bg-destructive text-white animate-shake'
                      : 'hover:bg-primary-soft'
                    }
                  `}
                >
                  {option}
                </Button>
              ))}
            </div>

            {showFeedback && (
              <div className="mt-6 text-center animate-bounce-in">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-2xl font-['Comic_Neue'] font-bold text-success">
                  Fantastic work! Keep going! ⭐
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};