import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { SearchService, SearchResult } from '@/services/searchService';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, results: SearchResult[]) => void;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = "Pesquisar produtos, serviços, notícias...",
  className = "",
  onSearch,
  showSuggestions = true,
  autoFocus = false
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2 && showSuggestions) {
      debounceRef.current = setTimeout(async () => {
        try {
          const newSuggestions = await SearchService.getSearchSuggestions(value);
          setSuggestions(newSuggestions);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowDropdown(false);

    try {
      const searchResults = await SearchService.globalSearch(searchQuery, {
        limit: 20,
        sortBy: 'relevance'
      });

      setResults(searchResults);
      
      if (onSearch) {
        onSearch(searchQuery, searchResults);
      } else {
        // Navigate to search results page
        navigate(`/pesquisa?q=${encodeURIComponent(searchQuery)}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          const selectedSuggestion = suggestions[selectedIndex];
          setQuery(selectedSuggestion);
          handleSearch(selectedSuggestion);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setShowDropdown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          className="pl-10 pr-20"
          disabled={isLoading}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            size="sm"
            className="h-8"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              'Pesquisar'
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3 w-3 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
