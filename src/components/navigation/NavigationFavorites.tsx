import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigationStore } from '@/stores/navigationStore';
import { useNavigate } from 'react-router-dom';
import { soundEffects } from '@/utils/sounds';
import { 
  Heart, 
  Star, 
  Clock, 
  Zap, 
  Folder, 
  FolderPlus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Grid,
  List,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  EyeOff,
  Share,
  Download,
  BookOpen,
  Calculator,
  Microscope,
  Palette,
  Users,
  Brain,
  Globe,
  Target,
  Award,
  Plus
} from 'lucide-react';

interface NavigationFavoritesProps {
  className?: string;
  view?: 'grid' | 'list';
  showCategories?: boolean;
}

const NavigationFavorites: React.FC<NavigationFavoritesProps> = ({ 
  className = '',
  view: initialView = 'grid',
  showCategories = true
}) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'grid' | 'list'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const {
    favorites,
    recentlyAccessed,
    quickAccess,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    navigateTo,
    trackNavigation
  } = useNavigationStore();

  const categoryIcons = {
    english: BookOpen,
    math: Calculator,
    science: Microscope,
    art: Palette,
    social: Users,
    problem: Brain,
    languages: Globe,
    habits: Target,
    physical: Zap,
    world: Award
  };

  // Get all unique categories
  const categories = Array.from(new Set([
    'all',
    ...favorites.map(item => item.category).filter(Boolean)
  ]));

  // Filter and sort favorites
  const filteredFavorites = favorites
    .filter(item => {
      // Search filter
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = (a.lastAccessed || 0) - (b.lastAccessed || 0);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'usage':
          // Sort by how recently accessed
          comparison = (a.lastAccessed || 0) - (b.lastAccessed || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle item click
  const handleItemClick = (item: any) => {
    navigateTo(item);
    navigate(item.path);
    trackNavigation(window.location.pathname, item.path, 'favorite');
    soundEffects.playClick();
  };

  // Handle remove from favorites
  const handleRemoveFavorite = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(item.id);
    soundEffects.playError();
  };

  // Handle create folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // TODO: Implement folder creation
      setNewFolderName('');
      setShowCreateFolder(false);
      soundEffects.playSuccess();
    }
  };

  // Format last accessed date
  const formatLastAccessed = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`navigation-favorites ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Favorites</span>
              <Badge variant="secondary">{favorites.length}</Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={currentView === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowCreateFolder(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export List
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {showCategories && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Filter className="h-4 w-4" />
                    <span className="capitalize">{selectedCategory}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map(category => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className="capitalize">{category}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  <span className="capitalize">{sortBy}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(['name', 'date', 'category', 'usage'] as const).map(option => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => {
                      if (sortBy === option) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(option);
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <span className="capitalize">{option}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? `No favorites match "${searchQuery}"`
                  : "Start adding activities and features to your favorites!"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/activities')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Activities
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-96">
              {currentView === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFavorites.map((item) => {
                    const Icon = item.category && categoryIcons[item.category as keyof typeof categoryIcons] 
                      ? categoryIcons[item.category as keyof typeof categoryIcons] 
                      : BookOpen;

                    return (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-md transition-shadow group"
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              {item.icon ? (
                                <span className="text-lg">{item.icon}</span>
                              ) : (
                                <Icon className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleItemClick(item)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Open
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Folder className="h-4 w-4 mr-2" />
                                  Move to Folder
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => handleRemoveFavorite(item, e)}
                                  className="text-red-600"
                                >
                                  <Heart className="h-4 w-4 mr-2" />
                                  Remove from Favorites
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <h3 className="font-medium mb-1 line-clamp-2">{item.title}</h3>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatLastAccessed(item.lastAccessed)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFavorites.map((item) => {
                    const Icon = item.category && categoryIcons[item.category as keyof typeof categoryIcons] 
                      ? categoryIcons[item.category as keyof typeof categoryIcons] 
                      : BookOpen;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group border"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                            {item.icon ? (
                              <span className="text-sm">{item.icon}</span>
                            ) : (
                              <Icon className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                              <span>•</span>
                              <span>{formatLastAccessed(item.lastAccessed)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleRemoveFavorite(item, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          >
                            <Heart className="h-3 w-3 text-red-500 fill-current" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your favorites into folders for better management.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NavigationFavorites;