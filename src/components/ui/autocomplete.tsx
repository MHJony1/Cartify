"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function Autocomplete({ value, onChange, options, placeholder }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) => opt.toLowerCase().includes(inputValue.toLowerCase()) && opt.toLowerCase() !== inputValue.toLowerCase()
  );

  const showCreateNew = inputValue.trim().length > 0 && !options.find((opt) => opt.toLowerCase() === inputValue.toLowerCase());

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="focus-visible:ring-primary focus-visible:border-primary"
      />
      
      {isOpen && (inputValue.trim().length > 0 || options.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-md max-h-60 overflow-auto">
          {filteredOptions.length === 0 && !showCreateNew && (
            <div className="p-2 text-sm text-muted-foreground text-center">No matches found</div>
          )}
          
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors"
              onClick={() => {
                setInputValue(opt);
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
          
          {showCreateNew && (
            <div
              className="px-3 py-2 text-sm cursor-pointer text-primary hover:bg-muted transition-colors border-t border-border mt-1 pt-1"
              onClick={() => {
                onChange(inputValue);
                setIsOpen(false);
              }}
            >
              Create new: <strong>{inputValue}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
