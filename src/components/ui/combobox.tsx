"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "./input";
import { ChevronDown } from "lucide-react";

interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  error?: boolean;
}

export function Combobox({ value, onChange, options, placeholder, error }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className={`flex items-center justify-between h-9 w-full rounded-md border ${error ? 'border-destructive focus-within:ring-destructive' : 'border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'} bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer`}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
      >
        <span className={selectedOption ? "" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder || "Select option"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-md max-h-60 flex flex-col">
          <div className="p-2 border-b border-border sticky top-0 bg-background">
            <Input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="h-8 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
          
          <div className="overflow-auto py-1">
            {filteredOptions.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground text-center">No options found</div>
            )}
            
            {filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors ${value === opt.value ? 'bg-muted/50 font-medium' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
