import { useState, useRef, useCallback, useEffect } from 'react';

export interface DragItem {
  id: string;
  type: string;
  data: any;
}

export interface DropZone {
  id: string;
  accepts: string[];
  onDrop: (item: DragItem) => void;
  onDragOver?: (item: DragItem) => void;
  onDragLeave?: () => void;
}

export interface UseDragAndDropOptions {
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem) => void;
  hapticFeedback?: boolean;
  soundEffects?: boolean;
}

export const useDragAndDrop = (options: UseDragAndDropOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropZones, setDropZones] = useState<Map<string, DropZone>>(new Map());
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragElement = useRef<HTMLElement | null>(null);

  // Haptic feedback for mobile devices
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (options.hapticFeedback && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [options.hapticFeedback]);

  // Sound feedback
  const playSound = useCallback((type: 'pick' | 'drop' | 'error') => {
    if (options.soundEffects) {
      // This would integrate with your existing sound system
      console.log(`Playing ${type} sound`);
    }
  }, [options.soundEffects]);

  // Register a draggable item
  const registerDraggable = useCallback((element: HTMLElement, item: DragItem) => {
    if (!element) return () => {};

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDraggedItem(item);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      dragElement.current = element;
      
      triggerHaptic('light');
      playSound('pick');
      options.onDragStart?.(item);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDraggedItem(item);
      dragStartPos.current = { x: touch.clientX, y: touch.clientY };
      dragElement.current = element;
      
      triggerHaptic('light');
      playSound('pick');
      options.onDragStart?.(item);
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, [triggerHaptic, playSound, options]);

  // Register a drop zone
  const registerDropZone = useCallback((dropZone: DropZone) => {
    setDropZones(prev => new Map(prev.set(dropZone.id, dropZone)));
    
    return () => {
      setDropZones(prev => {
        const newMap = new Map(prev);
        newMap.delete(dropZone.id);
        return newMap;
      });
    };
  }, []);

  // Handle global mouse/touch events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedItem || !dragStartPos.current) return;

      // Update drag element position
      if (dragElement.current) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        
        dragElement.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        dragElement.current.style.zIndex = '1000';
        dragElement.current.style.pointerEvents = 'none';
      }

      // Check for drop zone collision
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      if (elementBelow) {
        const dropZoneId = elementBelow.getAttribute('data-drop-zone-id');
        if (dropZoneId && dropZones.has(dropZoneId)) {
          const dropZone = dropZones.get(dropZoneId)!;
          if (dropZone.accepts.includes(draggedItem.type)) {
            if (activeDropZone !== dropZoneId) {
              setActiveDropZone(dropZoneId);
              dropZone.onDragOver?.(draggedItem);
              triggerHaptic('light');
            }
          }
        } else if (activeDropZone) {
          const prevDropZone = dropZones.get(activeDropZone);
          prevDropZone?.onDragLeave?.();
          setActiveDropZone(null);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!draggedItem || !dragStartPos.current) return;

      // Update drag element position
      if (dragElement.current) {
        const deltaX = touch.clientX - dragStartPos.current.x;
        const deltaY = touch.clientY - dragStartPos.current.y;
        
        dragElement.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        dragElement.current.style.zIndex = '1000';
        dragElement.current.style.pointerEvents = 'none';
      }

      // Check for drop zone collision
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elementBelow) {
        const dropZoneId = elementBelow.getAttribute('data-drop-zone-id');
        if (dropZoneId && dropZones.has(dropZoneId)) {
          const dropZone = dropZones.get(dropZoneId)!;
          if (dropZone.accepts.includes(draggedItem.type)) {
            if (activeDropZone !== dropZoneId) {
              setActiveDropZone(dropZoneId);
              dropZone.onDragOver?.(draggedItem);
              triggerHaptic('light');
            }
          }
        } else if (activeDropZone) {
          const prevDropZone = dropZones.get(activeDropZone);
          prevDropZone?.onDragLeave?.();
          setActiveDropZone(null);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!draggedItem) return;

      // Check if dropped on valid drop zone
      if (activeDropZone) {
        const dropZone = dropZones.get(activeDropZone);
        if (dropZone && dropZone.accepts.includes(draggedItem.type)) {
          dropZone.onDrop(draggedItem);
          triggerHaptic('medium');
          playSound('drop');
        } else {
          triggerHaptic('heavy');
          playSound('error');
        }
      }

      // Reset drag state
      if (dragElement.current) {
        dragElement.current.style.transform = '';
        dragElement.current.style.zIndex = '';
        dragElement.current.style.pointerEvents = '';
      }

      setIsDragging(false);
      setDraggedItem(null);
      setActiveDropZone(null);
      dragStartPos.current = null;
      dragElement.current = null;
      
      options.onDragEnd?.(draggedItem);
    };

    const handleTouchEnd = handleMouseUp;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, draggedItem, dropZones, activeDropZone, triggerHaptic, playSound, options]);

  return {
    isDragging,
    draggedItem,
    activeDropZone,
    registerDraggable,
    registerDropZone,
  };
};

// Utility component for drop zones
export interface DropZoneProps {
  id: string;
  accepts: string[];
  onDrop: (item: DragItem) => void;
  onDragOver?: (item: DragItem) => void;
  onDragLeave?: () => void;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  accepts,
  onDrop,
  onDragOver,
  onDragLeave,
  className = '',
  activeClassName = 'border-2 border-dashed border-blue-400 bg-blue-50',
  children,
}) => {
  const { activeDropZone, registerDropZone } = useDragAndDrop();
  
  useEffect(() => {
    return registerDropZone({
      id,
      accepts,
      onDrop,
      onDragOver,
      onDragLeave,
    });
  }, [id, accepts, onDrop, onDragOver, onDragLeave, registerDropZone]);

  const isActive = activeDropZone === id;

  return (
    <div
      data-drop-zone-id={id}
      className={`${className} ${isActive ? activeClassName : ''} transition-all duration-200`}
    >
      {children}
    </div>
  );
};

// Utility component for draggable items
export interface DraggableProps {
  item: DragItem;
  className?: string;
  dragClassName?: string;
  children: React.ReactNode;
}

export const Draggable: React.FC<DraggableProps> = ({
  item,
  className = '',
  dragClassName = 'opacity-50 scale-105 cursor-grabbing',
  children,
}) => {
  const { isDragging, draggedItem, registerDraggable } = useDragAndDrop();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      return registerDraggable(elementRef.current, item);
    }
  }, [item, registerDraggable]);

  const isBeingDragged = isDragging && draggedItem?.id === item.id;

  return (
    <div
      ref={elementRef}
      className={`${className} ${isBeingDragged ? dragClassName : 'cursor-grab'} transition-all duration-200`}
    >
      {children}
    </div>
  );
};